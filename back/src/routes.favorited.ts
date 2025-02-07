import { z } from "zod"
import express, { Response } from "express";
import * as url from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { authorize } from "./Middleware.js";


const router = express.Router();

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");


let genres = ["scifi", "romance", "adventure"] as const;
let bookSchema = z.object({
    author_id: z.preprocess((val) => Number(val), z.number()),
    title: z.string().min(1, "Title is required.").max(20, "Title cannot exceed 20 characters."),
    genre: z.enum(genres),
    pub_year: z.string().min(1, "Publication year is required.").max(4, "Publication year must be at most 4 characters long.").refine((val) => /^\d+$/.test(val), "Publication year must be numeric.")
});

type postResponse = Response<{ Location: number } | { error: string[] }>;
type getResponse = Response<{ books: string[] } | { error: string[] }>;
type deleteResponse = Response<string | { error: string[] }>;
type putResponse = Response<string | { error: string[] }>;

router.get("/", async (req, res: getResponse) => {
    let pub_year = req.query.pub_year;
    let queryString = pub_year === undefined ? "SELECT * FROM books" : `SELECT * FROM books WHERE pub_year = ?`;
    let result;
    try {
        result = await db.all(queryString, pub_year);
    } catch (err) {
        let error = err as Object;
        return res.status(500).json({ error: [error.toString()] });
    }
    return res.json({ books: result });
});

// router.use(authorize);

router.post("/", async (req, res: postResponse) => {
    let parseResult = bookSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseError(parseResult.error) });
    }

    let { author_id, title, genre, pub_year } = parseResult.data;

    let result;
    try {
        result = await db.all(`SELECT * FROM authors WHERE ID=?`, author_id);
    } catch (err) {
        let error = err as Object;
        return res.status(500).json({ error: [error.toString()] });
    }

    if (result.length === 0) {
        return res.status(400).json({ error: ["Author ID does not exist"] });
    }

    let dbResult;
    try {
        dbResult = await db.get(
            "INSERT INTO books(author_id, title, pub_year, genre) VALUES(?, ?, ?, ?) RETURNING *",
            [author_id, title, pub_year, genre]
        );
    } catch (err) {
        let error = err as Object;
        return res.status(500).json({ error: [error.toString()] });
    }
    let { id } = dbResult;
    return res.status(201).set("Location", id).json();
});

router.get("/:id", async (req, res: getResponse) => {
    let result;
    try {
        result = await db.all(`SELECT * FROM books WHERE ID = ?`, req.params.id);
    } catch (err) {
        let error = err as Object;
        return res.status(500).json({ error: [error.toString()] });
    }
    return res.json(result[0]);
});

router.delete("/:id", async (req, res: deleteResponse) => {
    try {
        let resp = await db.all(`SELECT * FROM books WHERE ID = ?`, req.params.id);
        if (resp.length === 0) {
            return res.status(400).json({ error: ["non existent book id"] });
        }

        await db.all(`DELETE FROM books WHERE ID = ?`, req.params.id);
    } catch (err) {
        let error = err as Object;
        return res.status(500).json({ error: [error.toString()] });
    }
    return res.status(201).set("Deleted").json();
});

router.put("/:id", async (req, res: putResponse) => {
    try {
        let id = req.params.id;
        let resp = await db.all("SELECT * FROM books WHERE id = ?", id);
        if (resp.length === 0) {
            return res.status(400).json({ error: ["Book ID does not exist"] });
        }

        let parseResult = bookSchema.safeParse(req.body);
        if (!parseResult.success) {
            console.log(parseResult.error)
            return res.status(400).json({ error: parseError(parseResult.error) });
        }

        let { author_id, title, genre, pub_year } = parseResult.data;

        await db.run('UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ? ', author_id, title, pub_year, genre, id)
    } catch (err) {
        let error = err as Object;
        return res.status(500).json({ error: [error.toString()] });
    }

    return res.status(204).set("Updated").json();
});

function parseError(zodError: z.ZodError): string[] {
    const { formErrors, fieldErrors } = zodError.flatten();
    const fieldErrorMessages = Object.values(fieldErrors).flatMap(
        (messages) => messages ?? []
    );
    return [...formErrors, ...fieldErrorMessages];
}

export default router;