/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_AUTH_MODE?: "normal" | "dev_no_jwt";
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
