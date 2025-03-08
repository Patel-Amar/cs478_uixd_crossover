import express from "express";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import searchRouter from "./routes.search.js";
import friendRouter from "./routes.friends.js";
import favoritedRouter from "./routes.favorited.js";
import loginRouter from "./routes.login.js";
import { authorize } from "./middleware.js";
import postsRouter from "./routes.post.js";
import commentsRouter from "./routes.comments.js"

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

let app = express();

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

const router = express.Router();

router.use("/", loginRouter);
router.use("/search", authorize, searchRouter);
router.use("/friends", authorize, friendRouter);
router.use("/favorited", authorize, favoritedRouter);
router.use("/feed", authorize, postsRouter);
router.use("/comment", authorize, commentsRouter);

app.use("/api", router);

// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
