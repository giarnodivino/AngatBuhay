import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RoutePlaceholder from "../pages/RoutePlaceholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/learners/assessments",
    element: <RoutePlaceholder title="Learner assessment dashboard" />,
  },
  {
    path: "/learners/:learnerId",
    element: <RoutePlaceholder title="Learner details" />,
  },
  {
    path: "/tutor/assessments/:assessmentId/scores",
    element: <RoutePlaceholder title="Assessment score entry" />,
  },
  {
    path: "/dashboard",
    element: <RoutePlaceholder title="Overall dashboard and insights" />,
  },
  {
    path: "*",
    element: <RoutePlaceholder title="Page not found" />,
  },
]);
