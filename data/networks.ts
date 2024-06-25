import { holesky, mainnet, sepolia } from "@wagmi/core/chains";

import Hyperchains from "@/hyperchains/config.json";

import type { Token } from "@/types";
import type { Chain } from "@wagmi/core/chains";

const portalRuntimeConfig = usePortalRuntimeConfig();

export const l1Networks = {
  mainnet: {
    ...mainnet,
    name: "Ethereum",
    network: "mainnet",
  },
  sepolia: {
    ...sepolia,
    name: "Ethereum Sepolia Testnet",
  },
  holesky: {
    ...holesky,
    name: "Holesky",
  },
} as const;
export type L1Network = Chain;

export type ZkSyncNetwork = {
  id: number;
  key: string;
  name: string;
  rpcUrl: string;
  hidden?: boolean; // If set to true, the network will not be shown in the network selector
  deprecated?: boolean;
  l1Network?: L1Network;
  blockExplorerUrl?: string;
  blockExplorerApi?: string;
  displaySettings?: {
    showPartnerLinks?: boolean;
  };
  getTokens?: () => Token[] | Promise<Token[]>; // If blockExplorerApi is specified, tokens will be fetched from there. Otherwise, this function will be used.
};

// See the official documentation on running a local zkSync node: https://era.zksync.io/docs/tools/testing/
// Also see the guide in the README.md file in the root of the repository.

// In-memory node default config. Docs: https://era.zksync.io/docs/tools/testing/era-test-node.html
export const inMemoryNode: ZkSyncNetwork = {
  id: 260,
  key: "in-memory-node",
  name: "In-memory node",
  rpcUrl: "http://localhost:8011",
};

// Dockerized local setup default config. Docs: https://era.zksync.io/docs/tools/testing/dockerized-testing.html
export const dockerizedNode: ZkSyncNetwork = {
  id: 270,
  key: "dockerized-node",
  name: "Dockerized local node",
  rpcUrl: "http://localhost:3050",
  l1Network: {
    id: 9,
    name: "Ethereum Local Node",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["http://localhost:8545"] },
      public: { http: ["http://localhost:8545"] },
    },
  },
};

const publicChains: ZkSyncNetwork[] = [
  {
    id: 5041,
    key: "zk-holesky-mantle-qa",
    name: "zk-holesky-mantle-qa",
    rpcUrl: "http://35.187.229.9:3050",
    blockExplorerUrl: "http://52.221.180.160:3010",
    l1Network: l1Networks.holesky,
    hidden: true,
  },
];

const nodeType = portalRuntimeConfig.nodeType;
const determineChainList = (): ZkSyncNetwork[] => {
  switch (nodeType) {
    case "memory":
      return [inMemoryNode];
    case "dockerized":
      return [dockerizedNode];
    case "hyperchain":
      return (Hyperchains as unknown as Array<{ network: ZkSyncNetwork; tokens: Token[] }>).map((e) => ({
        ...e.network,
        getTokens: () => e.tokens,
      }));
    default:
      return [...publicChains];
  }
};
export const isCustomNode = !!nodeType;
export const chainList: ZkSyncNetwork[] = determineChainList();
export const defaultNetwork = chainList[0];
