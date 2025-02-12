
import App from "@/App";
import { Route, Routes } from "react-router-dom";
import Search from "./Search";
import Feed from "./Feed";
import Friends from "./Friends";
import Login from "./Login";
import Wants from "./Wants";
import Register from "./Register";

function Layout() {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/collection" element={<Search />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/wants" element={<Wants />} />
            <Route path="/register" element={<Register />} />

        </Routes>

    );
}

export default Layout;