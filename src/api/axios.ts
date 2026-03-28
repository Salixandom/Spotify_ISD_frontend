import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const AUTH_MODE =
    (import.meta.env.VITE_AUTH_MODE ?? "normal").toLowerCase() === "dev_no_jwt"
        ? "dev_no_jwt"
        : "normal";

const isDevNoJwtMode = AUTH_MODE === "dev_no_jwt";

const axiosInstance = axios.create({
    baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
    if (isDevNoJwtMode) {
        return config;
    }

    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (isDevNoJwtMode) {
            // In dev_no_jwt mode, never refresh tokens or redirect to login automatically.
            return Promise.reject(error);
        }

        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${API_BASE}/auth/token/refresh/`,
                        {
                            refresh: refreshToken,
                        },
                    );

                    localStorage.setItem("access_token", response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return axiosInstance(originalRequest);
                } catch {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
