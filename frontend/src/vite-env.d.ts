/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NFT_ADDRESS: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
