CREATE TABLE favorited (
    id INTEGER PRIMARY KEY,
    spotify_id INTEGER,
    category_type INTEGER -- 0 for want and 1 for personal collection
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    token TEXT,
    username TEXT UNIQUE,
    password TEXT
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    post TEXT,
    user_id INTEGER,
    favorited_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(favorited_id) REFERENCES favorited(id)
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    comment TEXT,
    user_id INTEGER,
    post_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
)
