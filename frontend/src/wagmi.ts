import { http, createConfig } from "wagmi";
import { moonbaseAlpha } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [moonbaseAlpha],
  connectors: [injected()],
  transports: {
    [moonbaseAlpha.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
