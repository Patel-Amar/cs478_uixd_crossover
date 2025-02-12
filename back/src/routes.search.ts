import express, { Response, Request } from "express";
import * as url from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import "./env.js";
import axios from "axios";
import authenticate, { ACCESS_TOKEN, checkToken } from "./spotify.authenticate.js";

const router = express.Router();

type output = {
    name: string,
    release: string,
    artists: string[],
    album_image: string,
    id: string
}
type getResponse = Response<{ "albums": output[] } | { error: string[] }>;

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

async function search(req: Request, res: getResponse) {
    await checkToken();
    try {
        let q = req.params.search;
        if (q !== null || q === "") {
            let data = {
                q: q,
                type: "album",
                limit: 20
            }
            let resp = await axios.get("https://api.spotify.com/v1/search", {
                params: data,
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });

            let albums = resp.data.albums.items;

            if (albums.length === 0) {
                res.status(404).json({ error: ["No albums found"] });
            }

            let artistNames: string[] = [];

            let out: output[] = [];
            albums.forEach((element: any) => {
                console.log(element);
                element.artists.forEach((artist: any) => {
                    artistNames.push(artist.name)
                });

                let albumImage = element.images && element.images.length > 0
                    ? element.images[0].url
                    : null;

                out.push({
                    album_image: albumImage,
                    name: element.name,
                    release: element.release_date,
                    artists: artistNames,
                    id: element.id
                });

                artistNames = [];
            });

            return res.json({ albums: out });
        }
    }
    catch (err) {
        let error = err as Object
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            await authenticate(search);
        }
        return res.status(500).json({ error: [error.toString()] });
    }
};

router.use("/:search", search);

export default router;