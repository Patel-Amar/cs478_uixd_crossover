import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import express, { Response, Request } from "express";

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

const router = express.Router();

type responseType = Response<{ error: string } | { message: string }>;

async function remove(req: Request, res: responseType) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        let friendID = req.params.id;
        if (friendID !== null || friendID !== undefined) {
            resp = await db.get("SELECT id FROM friends WHERE friend1=? AND id=?", currentUserID, friendID);
            if (resp === undefined) {
                resp = await db.get("SELECT id FROM friends WHERE id=? AND friend2=?", friendID, currentUserID);
            }
        }
        else {
            return res.status(400).json({ error: "Invalid Friends ID" });
        }

        if (resp === undefined) {
            return res.status(400).json({ error: "Friendship you are trying to remove does not exist or you do not have permissions to remove." })
        }

        await db.run("DELETE FROM friends WHERE id=?", friendID);
        return res.status(200).json({ message: "Success" });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "There was an error removing this friendship." })
    }
}

async function add(req: Request, res: responseType) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        let recFriendID = req.params.id;
        if (recFriendID !== null || recFriendID !== undefined) {
            if (recFriendID === currentUserID) {
                return res.status(400).json({ error: "Can not send request to yourself" });
            }
            await db.run("INSERT INTO friends(friend1, friend2, pending) VALUES(?,?,?)", currentUserID, recFriendID, 1);
            return res.status(200).json({ message: "Success" });
        }
        return res.status(400).json({ error: "Could not add friend" });
    }
    catch (err: any) {
        console.log(err);
        if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "Friendship already exists." });
        }
        return res.status(500).json({ error: "There was an error removing this friendship." })
    }
}

async function viewFriends(req: Request, res: Response) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        resp = await db.all("SELECT \
                            f.id, \
                            CASE \
                                WHEN f.friend1 = ? THEN u2.username \
                                ELSE u1.username \
                            END AS friend_username \
                            FROM friends f \
                            JOIN users u1 ON f.friend1 = u1.id \
                            JOIN users u2 ON f.friend2 = u2.id \
                            WHERE(f.friend1 = ? OR f.friend2 = ?) AND f.pending = ?",
            currentUserID, currentUserID, currentUserID, 0);

        return res.status(200).json({ message: resp });
    }
    catch (err: any) {
        console.log(err);
        if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "Friendship already exists." });
        }
        return res.status(500).json({ error: "There was an error retrieving your friends." })
    }
}

async function viewRequests(req: Request, res: Response) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        resp = await db.all("SELECT \
                        f.id, \
                        u1.username AS friend_username \
                        FROM friends f \
                        JOIN users u1 ON f.friend2 = u1.id \
                        WHERE(f.friend2 = ?) AND f.pending = ?",
            currentUserID, 1);

        return res.status(200).json({ message: resp });
    }
    catch (err: any) {
        console.log(err);
        return res.status(500).json({ error: "There was an error retrieving your friend requests." })
    }
}

async function accept(req: Request, res: Response) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        let friendID = req.params.id;
        if (friendID !== null || friendID !== undefined) {
            resp = await db.get("SELECT id FROM friends WHERE friend2=? AND id=?", currentUserID, friendID);
        }
        else {
            return res.status(400).json({ error: "Invalid Friends ID" });
        }

        if (resp === undefined) {
            return res.status(400).json({ error: "Friendship you are trying to accept does not exist." })
        }

        await db.run("UPDATE friends SET pending=? WHERE id=?", 0, friendID);
        return res.status(200).json({ message: "Success" });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "There was an error accepting this friendship." })
    }
}

async function deny(req: Request, res: Response) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        let friendID = req.params.id;
        if (friendID !== null || friendID !== undefined) {
            resp = await db.get("SELECT id FROM friends WHERE friend2=? AND id=?", currentUserID, friendID);
        }
        else {
            return res.status(400).json({ error: "Invalid Friends ID" });
        }

        if (resp === undefined) {
            return res.status(400).json({ error: "Friendship you are trying to decline does not exist." })
        }

        await db.run("DELETE FROM friends WHERE id=?", friendID);
        return res.status(200).json({ message: "Success" });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "There was an error declining this friendship." })
    }
}

async function searchUsers(req: Request, res: Response) {
    try {
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;
        let searchTerm = req.params.search;
        if (searchTerm == null || searchTerm == undefined) {
            return res.status(400).json({ error: "Search term is empty" })
        }
        resp = await db.all("SELECT u.id, u.username AS friend_username FROM users u \
                        WHERE u.id != ? AND u.username LIKE ? \
                        AND NOT EXISTS( \
                            SELECT 1 FROM friends f \
                            WHERE(f.friend1 = u.id AND f.friend2 = ?) \
                                OR(f.friend2 = u.id AND f.friend1 = ?))", currentUserID, `%${searchTerm}%`, currentUserID, currentUserID);
        if (resp === undefined) {
            return res.status(400).json({ error: "Friendship you are trying to decline does not exist." })
        }

        return res.status(200).json({ message: resp });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "There was an error declining this friendship." })
    }
}

router.delete("/remove/:id", remove);
router.post("/add/:id", add);
router.get("/friends", viewFriends);
router.get("/requests", viewRequests);
router.put("/accept/:id", accept);
router.delete("/deny/:id", deny);
router.get("/search/:search", searchUsers);

export default router;
