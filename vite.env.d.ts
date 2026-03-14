/// <reference types="vite/client" />
declare module "*.css";

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    // add other VITE_ prefixed env vars here
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}