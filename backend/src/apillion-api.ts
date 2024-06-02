import axios from "axios";
import { Computing, Nft } from "@apillon/sdk";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

export const apillonAuthAPI = axios.create({
  baseURL: "https://api.apillon.io",
  headers: {
    Authorization: process.env.APILLION_BASIC_AUTH,
  },
});

export const apillonConfig = {
  key: process.env.APILLION_API_KEY,
  secret: process.env.APILLION_SECRET_KEY,
};

export const apillonServiceIds = {
  nftCollectionUUID: process.env.NFT_COLLECTION_UUID as string,
  computeContractUUID: process.env.COMPUTE_CONTRACT_UUID as string,
};

export const computing = new Computing(apillonConfig);

export const nft = new Nft(apillonConfig);

export interface ITransferData {
  receivingAddress: `0x${string}`;
  receiverEmail: string;
  senderEmail: string;
  message: string;
  fileName: string;
  fileContent: string;
  nftId: number;
}

export const transfer = async ({
  receivingAddress,
  fileName,
  fileContent,
  nftId,
}: ITransferData) => {
  // mint NFT
  const collection = await nft
    .collection(apillonServiceIds.nftCollectionUUID)
    .get();
  const { success } = await collection.mint({
    receivingAddress,
    quantity: 1,
  });
  if (!success) {
    throw new Error("Failed to mint NFT");
  }
  // encrypt file and interact with phat contract
  const computingContract = computing.contract(
    apillonServiceIds.computeContractUUID
  );
  const encryptionResult = await computingContract.encryptFile({
    fileName,
    content: Buffer.from(fileContent, "base64"),
    nftId, // NFT ID used for decryption authentication
  });

  return encryptionResult;
};

// const storage = new Storage(apillonConfig);

// export const encryptFile = async (
//   fileName: string,
//   nftId: number,
//   fileContent: string,
//   contentType: string
// ) => {
//   const response = await apillonAuthAPI.post(
//     `/computing/contracts/${process.env.COMPUTE_CONTRACT_UUID}/encrypt`,
//     {
//       content: fileContent,
//       contract_uuid: process.env.COMPUTE_CONTRACT_UUID,
//     }
//   );

//   const uploadResult = await bucket.uploadFiles(
//     [
//       {
//         fileName,
//         content: response.data.encryptedContent,
//         contentType,
//       },
//     ],
//     { awaitCid: true }
//   );
//   console.log(uploadResult);

//   const response2 = await apillonAuthAPI.post(
//     `/computing/contracts/${process.env.COMPUTE_CONTRACT_UUID}/assign-cid-to-nft`,
//     {
//       cid: uploadResult[0].CID,
//       nftId,
//     }
//   );
//   console.log(response2);
//   return response2;
// };
