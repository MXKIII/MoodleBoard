import React, { useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Components/shared/Authentification";
import { UserProvider } from "./Components/shared/UserContext";
import ProtectedRoute from "./Components/shared/ProtectedRoute";

const Layout = lazy(() => import("./Components/shared/Layout"));
const QueryResult = lazy(
  () => import("./Components/shared/QueryResult")
);
const LoginPage = lazy(() => import("./Components/shared/LoginPage"));
const AdminHome = lazy(() => import("./Components/Admin/AdminHome"));
const StudentHome = lazy(
  () => import("./Components/Student/StudentHome")
);
const TeacherHome = lazy(
  () => import("./Components/Teacher/TeacherHome")
);
const QueryGraph = lazy(() => import("./Components/shared/QueryGraph"));
const NewsFeed = lazy(() => import("./Components/shared/NewsFeed"));

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <AuthProvider>
      <UserProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route
                index
                element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
              />
              <Route path="news" element={<NewsFeed />} />
              <Route path="/query-result" element={<QueryResult />} />
              <Route
                path="/Manager"
                element={
                  <ProtectedRoute acceptedRoles={["Manager"]}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Student"
                element={
                  <ProtectedRoute acceptedRoles={["Student"]}>
                    <StudentHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Teacher"
                element={
                  <ProtectedRoute acceptedRoles={["Teacher"]}>
                    <TeacherHome />
                  </ProtectedRoute>
                }
              />
              <Route path="/Graph" element={<QueryGraph />} />
            </Route>
            <Route
              path="/news"
              element={
                <ProtectedRoute
                  acceptedRoles={["Manager", "Student", "Teacher"]}
                >
                  <NewsFeed />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
