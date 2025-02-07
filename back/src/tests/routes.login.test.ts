import axios, { AxiosError } from "axios";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { afterEach, beforeEach, it } from "node:test";
import assert, { fail } from "assert";

let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}/api`;
axios.defaults.baseURL = baseUrl;

sqlite3.verbose();

function wrapper() {
    let db: Database;
    async function inner() {
        if (!db) {
            db = await open({
                filename: "./database.db",
                driver: sqlite3.Database,
            });
        }
        return db;
    }
    return inner;
}
let getDB = wrapper();