import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { Worker } from "worker_threads";

import { ITransferData, apillonAuthAPI } from "./apillion-api";
import { authenticateToken, generateAccessToken } from "./jwt";
import { getMintedNftCount } from "./viem";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Function to spawn a worker thread
export const spawnWorker = (workerData: ITransferData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "worker.ts"), {
      workerData,
    });

    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

const port = process.env.PORT ? +process.env.PORT : 3000;

app.get("/session-token", async (req, res) => {
  const response = await apillonAuthAPI.get("/auth/session-token");
  res.json(response.data);
});

app.post("/verify-login", async (req, res) => {
  const token = req.body.token;
  const response = await apillonAuthAPI.post(`/auth/verify-login`, { token });
  const jwtToken = generateAccessToken(response.data.data.email);
  res.json({ token: jwtToken, ...response.data });
});

app.post("/transfer", authenticateToken, async (req, res) => {
  const mintCounter = await getMintedNftCount();
  const nftId = mintCounter + 1;
  console.log("nftId", nftId);
  res.send({ nftId });

  // Spawn a background worker to handle the time-consuming task
  try {
    const result = await spawnWorker({
      receivingAddress: req.body.address,
      receiverEmail: req.body.receiverEmail,
      senderEmail: req.body.senderEmail,
      message: req.body.message,
      fileName: req.body.fileData.name,
      fileContent: req.body.fileData.content,
      nftId,
    });
    console.log("Background task result:", result);
  } catch (err) {
    console.error("Background task error:", err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
