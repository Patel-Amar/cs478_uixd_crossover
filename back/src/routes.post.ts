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
    post: string;
    username: string;
    name: string;
    album_image: string;
    id: number;
};
type getResponse = Response<{ posts: output[] } | { error: string[] } | {}>;

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

async function addPost(req: Request, res: getResponse) {
    try {
        const { post, album_id } = req.body;
        if (!post || !album_id) {
            return res.status(400).json({ error: ["Invalid Data"] });
        }

        let { auth_token } = req.cookies;
        let resp = await db.get(
            "SELECT * FROM users WHERE token = ?",
            auth_token
        );
        let currentUserID = resp.id;

        await db.run(
            "INSERT INTO posts(post, user_id, spotify_id) VALUES(?,?,?)",
            post,
            currentUserID,
            album_id
        );

        return res.status(200).json({});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: ["Could not add post"] });
    }
}

async function getPost(req: Request, res: getResponse) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get(
            "SELECT * FROM users WHERE token = ?",
            auth_token
        );
        let currentUserID = resp.id;

        resp = await db.all(
            `SELECT p.post, u.username, p.spotify_id, p.id, p.user_id
                            FROM posts p
                            JOIN users u ON u.id = p.user_id
                            LEFT JOIN friends f1 ON f1.friend1 = p.user_id AND f1.friend2 = ? AND f1.pending = 0
                            LEFT JOIN friends f2 ON f2.friend2 = p.user_id AND f2.friend1 = ? AND f2.pending = 0
                            WHERE p.user_id = ? OR f1.friend2 IS NOT NULL OR f2.friend1 IS NOT NULL`,
            [currentUserID, currentUserID, currentUserID]
        );

        let out: output[] = [];
        for (let data of resp) {
            const resp = await axios.get(
                `https://api.spotify.com/v1/albums/${data.spotify_id}`,
                {
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                }
            );

            let albumImage = resp.data.images[0]?.url || null;

            out.push({
                post: data.post,
                username:
                    data.user_id !== currentUserID ? data.username : "You",
                name: resp.data.name,
                album_image: albumImage,
                id: data.id,
            });
        }

        return res.status(200).json({ post: out });
    } catch (err) {
        return res.status(500).json({ error: ["Could not retrieve posts."] });
    }
}

router.post("/", addPost);
router.get("/", getPost);

export default router;
