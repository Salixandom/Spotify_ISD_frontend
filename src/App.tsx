import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { BrowsePage } from "./pages/BrowsePage";
import { PlaylistPage } from "./pages/PlaylistPage";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 30,
        },
    },
});

// Env-driven auth mode:
// - "normal" => JWT auth checks enabled
// - "dev_no_jwt" => auth checks bypassed for frontend-only development
const AUTH_MODE =
    (import.meta.env.VITE_AUTH_MODE ?? "normal").toLowerCase() === "dev_no_jwt"
        ? "dev_no_jwt"
        : "normal";

const isDevNoJwtMode = AUTH_MODE === "dev_no_jwt";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    if (isDevNoJwtMode) {
        return <>{children}</>;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return <Navigate to="/login" replace />;

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    useAuth();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="browse" element={<BrowsePage />} />
                <Route path="playlist/:id" element={<PlaylistPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
