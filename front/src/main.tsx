import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
// import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
// import Login from "./components/Login";
// import Search from "./components/Search";
// import Friends from "./components/Friends";
// import Feed from "./components/Feed";
// import Collection from "./components/Collection";
// import Wants from "./components/Wants";
// import Logout from "./components/Logout";
import { Provider } from "./components/ui/provider";
import { BrowserRouter } from "react-router-dom";


// const router = createBrowserRouter([
//     {
//         element: <Layout />,
//         children: [
//             {
//                 path: "/",
//                 element: <App />,
//             },
//             {
//                 path: "/search",
//                 element: <Search />,
//             }
//             ,
//             {
//                 path: "/friends",
//                 element: <Friends />,
//             },
//             {
//                 path: "/feed",
//                 element: <Feed />,
//             },
//             {
//                 path: "/collection",
//                 element: <Collection />,
//             },
//             {
//                 path: "/wants",
//                 element: <Wants />,
//             },
//             {
//                 path: "/login",
//                 element: <Login />
//             },
//             {
//                 path: "/logout",
//                 element: <Logout />
//             }
//         ],
//     },
// ]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider>
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
);
