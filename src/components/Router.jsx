import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "./SignUp";
import Signin from "./SignIn";
import Dashboard from "../route/Dashboard";
import PrivateRoute from "./PrivateRoute";
import GoldPreciousMetals from "../investments/GoldPreciousMetals";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "../admin/Dashboard";
import AdminUsers from "../admin/Users";
import AdminActiveUsers from "../admin/ActiveUsers";
import AdminBalance from "../admin/BalanceManagement";
import AdminInvestments from "../admin/Investments";
import AdminMaterials from "../admin/Materials";
import AdminTransactions from "../admin/Transactions";
import AdminLogin from "../pages/AdminLogin";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  { path: "/admin-login", element: <AdminLogin /> },
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
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <AdminUsers />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/active-users",
    element: (
      <AdminRoute>
        <AdminActiveUsers />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/balance",
    element: (
      <AdminRoute>
        <AdminBalance />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/investments",
    element: (
      <AdminRoute>
        <AdminInvestments />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/materials",
    element: (
      <AdminRoute>
        <AdminMaterials />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/transactions",
    element: (
      <AdminRoute>
        <AdminTransactions />
      </AdminRoute>
    ),
  },
]);
