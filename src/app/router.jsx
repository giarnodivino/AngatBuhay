import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardInsightsPage from "../pages/DashboardInsightsPage";
import LearnerAssessmentsPage from "../pages/LearnerAssessmentsPage";
import LoginPage from "../pages/LoginPage";
import RoutePlaceholder from "../pages/RoutePlaceholder";
import TutorAssessmentScoresPage from "../pages/TutorAssessmentScoresPage";

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
    element: <LearnerAssessmentsPage />,
  },
  {
    path: "/learners/:learnerId",
    element: <RoutePlaceholder title="Learner details" />,
  },
  {
    path: "/tutor/assessments/:assessmentId/scores",
    element: <TutorAssessmentScoresPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardInsightsPage />,
  },
  {
    path: "*",
    element: <RoutePlaceholder title="Page not found" />,
  },
]);
