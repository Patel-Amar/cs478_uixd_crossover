import * as argon2 from "argon2";
import crypto from "crypto";
import sqlite3 from "sqlite3";
import * as sqlite from "sqlite";
import * as url from "url";
import express, {
    Request,
    Response,
    RequestHandler,
    CookieOptions,
} from "express";
import path from "path";

let __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let router = express.Router();

let dbfile = path.resolve(__dirname, "..", "database.db");
let db = await sqlite.open({
    filename: dbfile,
    driver: sqlite3.Database,
});

export default router;