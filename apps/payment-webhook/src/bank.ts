import { Router, json } from "express";
import { createClient } from "redis";
import { prisma } from "@repo/db";

//bank withdraw means deposit to inpay

interface BankResponse {
  txId: string;
  status: "FAILED" | "SUCCESS";
}

const bank = Router();
bank.use(json());

const redisClientPush = createClient();
const redisClientPop = createClient();
redisClientPush.on("error", (err) => {
  console.error(err);
});
redisClientPop.on("error", (err) => {
  console.error(err);
});
startRedisPush();
startRedisPop();
depositToInpay();

async function startRedisPush() {
  await redisClientPush.connect();
}
async function startRedisPop() {
  await redisClientPop.connect();
}
async function depositToInpay() {
  while (1) {
    console.log("Checking for deposits");
    const frontTx = await redisClientPop.brPop("deposits", 0);
    console.log("front redis", frontTx);
    const value: BankResponse = JSON.parse(frontTx?.element ?? "");
    if (!value) continue;
    try {
      await prisma.transactions.update({
        where: {
          id: value.txId,
        },
        data: {
          status: value.status,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}

bank.post("/deposit", async (req, res) => {
  const { txId, status } = req.body;
  const result = await redisClientPush.lPush(
    "deposits",
    JSON.stringify({ txId, status })
  );
  console.log("result", result);
  res.status(200).json({ message: "User Deposit Request Received" });
});

export default bank;
