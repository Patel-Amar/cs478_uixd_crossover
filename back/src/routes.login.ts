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

// Function to generate a random token
function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

// Initialize Database Before Setting Routes
(async () => {
    let dbfile = path.resolve(__dirname, "..", "database.db");
    db = await sqlite.open({
        filename: dbfile,
        driver: sqlite3.Database,
    });

    // User Sign-Up Route
    router.post("/signup", async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        try {
            const existingUser = await db.get("SELECT * FROM users WHERE username = ?", [username]);
            if (existingUser) {
                return res.status(400).json({ error: "Username already taken." });
            }

            const hashedPassword = await argon2.hash(password);
            const token = generateToken();
            await db.run("INSERT INTO users (username, password, token) VALUES (?, ?, ?)", [username, hashedPassword, token]);
            res.cookie("auth_token", token, { httpOnly: true });
            res.json({ message: "User registered successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // User Login Route
    router.post("/login", async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        try {
            const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
            if (!user || !(await argon2.verify(user.password, password))) {
                return res.status(401).json({ error: "Invalid username or password." });
            }

            const token = generateToken();
            await db.run("UPDATE users SET token = ? WHERE id = ?", [token, user.id]);
            res.cookie("auth_token", token, { httpOnly: true });
            res.json({ message: "Login successful." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
})();

export default router;