import React, { useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Client/components/shared/Authentification";
import { UserProvider } from "./Client/UserContext";
import ProtectedRoute from "./Client/components/shared/ProtectedRoute";

const Layout = lazy(() => import("./Client/components/shared/Layout"));
const QueryResult = lazy(
  () => import("./Client/components/shared/QueryResult")
);
const LoginPage = lazy(() => import("./Client/components/shared/LoginPage"));
const AdminHome = lazy(() => import("./Client/components/Admin/AdminHome"));
const StudentHome = lazy(
  () => import("./Client/components/Student/StudentHome")
);
const TeacherHome = lazy(
  () => import("./Client/components/Teacher/TeacherHome")
);
const QueryGraph = lazy(() => import("./Client/components/shared/QueryGraph"));
const NewsFeed = lazy(() => import("./Client/components/shared/NewsFeed"));

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
