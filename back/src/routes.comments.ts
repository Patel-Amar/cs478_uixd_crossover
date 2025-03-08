import express, { Response, Request } from "express";
import * as url from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import "./env.js";
import axios from "axios";
import authenticate, {
    ACCESS_TOKEN,
    checkToken,
} from "./spotify.authenticate.js";

const router = express.Router();

type output = {
    comment: string;
    username: string;
    post_id: number;
    user_id: number;
};
type getResponse = Response<{ posts: output[] } | { error: string[] } | {}>;

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

async function addComment(req: Request, res: getResponse) {
    try {
        const { comment, post_id } = req.body;
        if (!comment || !post_id) {
            return res.status(400).json({ error: ["Invalid Data"] });
        }

        let { auth_token } = req.cookies;
        let resp = await db.get(
            "SELECT * FROM users WHERE token = ?",
            auth_token
        );
        let currentUserID = resp.id;

        await db.run(
            "INSERT INTO comments(comment,user_id, post_id) VALUES(?,?,?)",
            comment,
            currentUserID,
            post_id
        );

        return res.status(200).json({});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: ["Could not add comment"] });
    }
}

async function getComment(req: Request, res: getResponse) {
    try {
        let { auth_token } = req.cookies;

        let resp = await db.get(
            "SELECT * FROM users WHERE token = ?",
            auth_token
        );
        let currentUserID = resp.id;

        resp = await db.all(
            `SELECT c.comment, u.username, c.post_id, c.user_id
                            FROM comments c
                            JOIN users u ON u.id = c.user_id`
        );

        let out: output[] = [];
        for (let data of resp) {
            out.push({
                comment: data.comment,
                username:
                    data.user_id !== currentUserID ? data.username : "You",
                post_id: data.post_id,
                user_id: data.user_id,
            });
        }

        return res.status(200).json({ post: out });
    } catch (err) {
        return res.status(500).json({ error: ["Could not retrieve posts."] });
    }
}

router.post("/", addComment);
router.get("/", getComment);

export default router;
