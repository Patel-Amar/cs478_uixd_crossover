import { z } from "zod"
import express, { Response } from "express";
import * as url from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { ACCESS_TOKEN, checkToken } from "./spotify.authenticate.js";
import axios from "axios";


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

function checkFavoritedStatus(category_id: string, favorited: string) {
    let isCollection = category_id === "1";
    let isFavorited = favorited === "1";

    return {
        isCollection,
        isFavorited
    };
}

interface Artist {
    name: string;
}

router.get("/album/:id", async (req, res) => {
    await checkToken();
    try {
        let albumId = req.params.id;
        if (!albumId) {
            return res.status(400).json({ error: "Missing album ID" });
        }

        let resp = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
            params: {
                limit: 50,
            },
        });

        let tracks = resp.data.items.map((track: any) => ({
            name: track.name,
            duration: track.duration_ms,
        }));

        return res.json({ tracks });
    } catch (err) {
        console.error("Error fetching album tracks:", err);
        return res.status(500).json({ error: "Failed to fetch tracks" });
    }
});


router.post("/:spotify_id/:category_type/:favorited", async (req, res) => {
    try {
        if (req.params.spotify_id===undefined || req.params.category_type===undefined || req.params.favorited===undefined) {
            return res.status(400).json({ error: "invalid" });
        }
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;

        await db.run(
            "INSERT INTO favorited (spotify_id, category_type, favorited, user_name) VALUES (?, ?, ?, ?)", req.params.spotify_id, req.params.category_type, req.params.favorited, currentUserID
        );

        res.status(201).json();

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: parseError(error) });
        }
        console.error("Error adding album:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/:spotify_id/:category_type/:favorited", async (req, res) => {
    try {
        if (req.params.spotify_id===undefined || req.params.category_type===undefined || req.params.favorited===undefined) {
            return res.status(400).json({ error: "invalid" });
        }
        let { auth_token } = req.cookies;
        let resp = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        let currentUserID = resp.id;

        await db.run(
            `UPDATE favorited SET category_type = ?, favorited = ? WHERE spotify_id = ? AND user_name = ?`,
            req.params.category_type, req.params.favorited, req.params.spotify_id, currentUserID
        );
        res.status(201).json({ message: "Album updated successfully!" });

    } catch (err) {
        console.error("Error updating album:", err);
        return res.status(500).json({ error: "Failed to update album" });
    }
});

router.get("/collection/favorites", async (req, res) => {
    try {
        const { auth_token } = req.cookies;
        if (!auth_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const albums = await db.all(
            "SELECT spotify_id, favorited FROM favorited WHERE category_type = 1 AND favorited = 1 AND user_name = ?",
            user.id
        );

        // Fetch album details from Spotify API for each spotify_id
        await checkToken();
        const albumData = await Promise.all(
            albums.map(async (album) => {
                const resp = await axios.get(`https://api.spotify.com/v1/albums/${album.spotify_id}`, {
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                });
                return {
                    id: resp.data.id,
                    name: resp.data.name,
                    release: resp.data.release_date,
                    artists: resp.data.artists.map((artist: Artist) => artist.name),
                    album_image: resp.data.images[0]?.url || null,
                    favorited: album.favorited
                };
            })
        );

        res.status(200).json({ albums: albumData });
    } catch (error) {
        console.error("Error fetching favorites in collection:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/collection", async (req, res) => {
    try {
        const { auth_token } = req.cookies;
        if (!auth_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const albums = await db.all(
            "SELECT spotify_id, favorited FROM favorited WHERE category_type = 1 AND user_name = ?",
            user.id
        );

        // Fetch album details from Spotify API for each spotify_id
        await checkToken();
        const albumData = await Promise.all(
            albums.map(async (album) => {
                const resp = await axios.get(`https://api.spotify.com/v1/albums/${album.spotify_id}`, {
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                });
                return {
                    id: resp.data.id,
                    name: resp.data.name,
                    release: resp.data.release_date,
                    artists: resp.data.artists.map((artist: Artist) => artist.name),
                    album_image: resp.data.images[0]?.url || null,
                    favorited: album.favorited
                };
            })
        );

        res.status(200).json({ albums: albumData });
    } catch (error) {
        console.error("Error fetching collection:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/wishlist/favorites", async (req, res) => {
    try {
        const { auth_token } = req.cookies;
        if (!auth_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const albums = await db.all(
            "SELECT spotify_id, favorited FROM favorited WHERE category_type = 0 AND favorited = 1 AND user_name = ?",
            user.id
        );

        // Fetch album details from Spotify API for each spotify_id
        await checkToken();
        const albumData = await Promise.all(
            albums.map(async (album) => {
                const resp = await axios.get(`https://api.spotify.com/v1/albums/${album.spotify_id}`, {
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                });
                return {
                    id: resp.data.id,
                    name: resp.data.name,
                    release: resp.data.release_date,
                    artists: resp.data.artists.map((artist: Artist) => artist.name),
                    album_image: resp.data.images[0]?.url || null,
                    favorited: album.favorited
                };
            })
        );

        res.status(200).json({ albums: albumData });
    } catch (error) {
        console.error("Error fetching favorites in wishlist:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/wishlist", async (req, res) => {
    try {
        const { auth_token } = req.cookies;
        if (!auth_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const albums = await db.all(
            "SELECT spotify_id, favorited FROM favorited WHERE category_type = 0 AND user_name = ?",
            user.id
        );

        // Fetch album details from Spotify API for each spotify_id
        await checkToken();
        const albumData = await Promise.all(
            albums.map(async (album) => {
                const resp = await axios.get(`https://api.spotify.com/v1/albums/${album.spotify_id}`, {
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                });
                return {
                    id: resp.data.id,
                    name: resp.data.name,
                    release: resp.data.release_date,
                    artists: resp.data.artists.map((artist: Artist) => artist.name),
                    album_image: resp.data.images[0]?.url || null,
                    favorited: album.favorited
                };
            })
        );

        res.status(200).json({ albums: albumData });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/album/:id", async (req, res) => {
    await checkToken();
    try {
        let albumId = req.params.id;
        if (!albumId) {
            return res.status(400).json({ error: "Missing album ID" });
        }

        const { auth_token } = req.cookies;
        if (!auth_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await db.get("SELECT * FROM users WHERE token = ?", auth_token);
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const result = await db.run(
            "DELETE FROM favorited WHERE spotify_id = ? AND user_name = ?",
            albumId,
            user.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Album not found in user's favorited list" });
        }

        res.status(200).json({ message: "Album removed from favorites" });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(500).json({ error: "Failed to remove album from favorites", details: err.message });
        } else {
            return res.status(500).json({ error: "Failed to remove album from favorites", details: "Unknown error occurred" });
        }
    }
});







export default router;