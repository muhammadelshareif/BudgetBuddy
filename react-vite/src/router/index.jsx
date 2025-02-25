import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Layout from "./Layout";
import Dashboard from "../components/Dashboard/Dashboard";
import CategoryList from "../components/Categories/CategoryList";
import CategoryForm from "../components/Categories/CategoryForm";
import TransactionList from "../components/Transactions/TransactionList";
import TransactionForm from "../components/Transactions/TransactionForm";
import { useSelector } from "react-redux";

// Create a protected route wrapper
const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.session.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <ProtectedRoute>
            <CategoryList />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories/new",
        element: (
          <ProtectedRoute>
            <CategoryForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories/:categoryId/edit",
        element: (
          <ProtectedRoute>
            <CategoryForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions",
        element: (
          <ProtectedRoute>
            <TransactionList />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions/new",
        element: (
          <ProtectedRoute>
            <TransactionForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions/:transactionId/edit",
        element: (
          <ProtectedRoute>
            <TransactionForm />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
