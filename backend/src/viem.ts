import { createPublicClient, http, getContract } from "viem";
import { moonbaseAlpha } from "viem/chains";
import { nftAbi } from "./abi";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

const client = createPublicClient({
  chain: moonbaseAlpha,
  transport: http(),
});

const contract = getContract({
  address: process.env.NFT_CONTRACT_ADDRESS as `0x${string}`,
  abi: nftAbi,
  client,
});

export const getMintedNftCount = async () =>
  Number((await contract.read.mintCounter()) as bigint);
