/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_TENANT_NAME?: string;
  readonly VITE_TENANT_INITIALS?: string;
  readonly VITE_TENANT_SUBDOMAIN?: string;
  readonly VITE_TENANT_HOST_USER_ID?: string;
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
