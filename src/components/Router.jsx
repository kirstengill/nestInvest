import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "./SignUp";
import Signin from "./SignIn";
import Dashboard from "../route/Dashboard";
import PrivateRoute from "./PrivateRoute";
import GoldPreciousMetals from "../investments/GoldPreciousMetals";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/investments/gold-precious-metals",
    element: (
      <PrivateRoute>
        <GoldPreciousMetals />
      </PrivateRoute>
    ),
  },
]);
