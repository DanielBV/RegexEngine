declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VERSION: string;
        }
    }
}

declare module "*.css";

export {};
