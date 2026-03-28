import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../api/auth";

const isDevNoJwtMode =
    (import.meta.env.VITE_AUTH_MODE ?? "normal").toLowerCase() === "dev_no_jwt";

export const useAuth = () => {
    const { user, isAuthenticated, setUser, logout } = useAuthStore();

    useEffect(() => {
        // In dev_no_jwt mode, skip auth bootstrap entirely.
        if (isDevNoJwtMode) {
            return;
        }

        const token = localStorage.getItem("access_token");
        if (token && !user) {
            authAPI.me().then(setUser).catch(logout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return { user, isAuthenticated, logout };
};
