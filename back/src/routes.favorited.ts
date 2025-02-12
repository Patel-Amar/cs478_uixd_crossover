import { z } from "zod"
import express, { Response } from "express";
import * as url from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";


const router = express.Router();

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

function parseError(zodError: z.ZodError): string[] {
    const { formErrors, fieldErrors } = zodError.flatten();
    const fieldErrorMessages = Object.values(fieldErrors).flatMap(
        (messages) => messages ?? []
    );
    return [...formErrors, ...fieldErrorMessages];
}

export default router;