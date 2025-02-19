import { Request, Response, NextFunction } from "express";
import sqlite3 from "sqlite3";
import * as sqlite from "sqlite";
import * as url from "url";
import path from "path";

let __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let dbfile = path.resolve(__dirname, "..", "database.db");
let db = await sqlite.open({
    filename: dbfile,
    driver: sqlite3.Database,
});

export async function authorize(req: Request, res: Response, next: NextFunction) {
    let { token } = req.cookies;
    if (token === undefined) {
        return res.status(403).json({ error: ["Unauthorized"] });
    }

    let resp = await db.get("SELECT * FROM users WHERE token = ?", token);
    if (!resp) {
        return res.status(403).json({ error: ["Unauthorized"] });
    }
    next();
};