import express from "express";
import cookieParser from "cookie-parser";

let app = express();
app.use(express.json());
app.use(cookieParser());

const router = express.Router();

app.use("/api", router);


// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
