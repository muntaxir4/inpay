import { Router, json } from "express";
import { createClient } from "redis";
import { prisma } from "@repo/db";

//bank withdraw means deposit to inpay

interface BankResponse {
  txId: string;
  status: "FAILED" | "SUCCESS";
  type: TransactionType;
}

enum TransactionType {
  DEPOSIT = 0,
  WITHDRAW = 1,
}

const bank = Router();
bank.use(json());

const REDIS_URL = process.env.REDIS_URL;
const WEBSOCKET_URL = process.env.WEBSOCKET_URL;
console.log("REDIS_URL", REDIS_URL);

const redisClientPush = createClient({
  url: REDIS_URL,
});
const redisClientPop = createClient({
  url: REDIS_URL,
});
redisClientPush.on("error", (err) => {
  console.error(err);
});
redisClientPop.on("error", (err) => {
  console.error(err);
});
startRedisPush();
startRedisPop();
workerInpay();

async function startRedisPush() {
  await redisClientPush.connect();
}
async function startRedisPop() {
  await redisClientPop.connect();
}
async function workerInpay() {
  while (1) {
    const frontTx = await redisClientPop.brPop("bankTx", 0);
    const value: BankResponse = JSON.parse(frontTx?.element ?? "");
    if (!value) continue;
    try {
      const tx = await prisma.transactions.update({
        where: {
          id: value.txId,
        },
        data: {
          status: value.status,
        },
        select: {
          from: true,
          amount: true,
        },
      });
      if (value.status === "SUCCESS") {
        // Deposit to inpay
        if (value.type === TransactionType.DEPOSIT) {
          await prisma.userAccount.update({
            where: {
              id: tx.from,
            },
            data: {
              balance: {
                increment: tx.amount,
              },
            },
          });
          fetch(WEBSOCKET_URL + "/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: tx.from,
              amount: tx.amount,
              type: 0,
              status: 1,
            }),
          });
        } else {
          // Withdraw from inpay
          await prisma.userAccount.update({
            where: {
              id: tx.from,
            },
            data: {
              balance: {
                decrement: tx.amount,
              },
            },
          });
          fetch(WEBSOCKET_URL + "/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: tx.from,
              amount: tx.amount,
              type: 1,
              status: 1,
            }),
          });
        }
      } else {
        fetch(WEBSOCKET_URL + "/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: tx.from,
            amount: tx.amount,
            type: value.type,
            status: 0,
          }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}

bank.post("/deposit", async (req, res) => {
  const { txId, status } = req.body;
  await redisClientPush.lPush(
    "bankTx",
    JSON.stringify({ txId, status, type: TransactionType.DEPOSIT })
  );
  res.status(200).json({ message: "User Deposit Request Received" });
});

bank.post("/withdraw", async (req, res) => {
  const { txId, status } = req.body;
  await redisClientPush.lPush(
    "bankTx",
    JSON.stringify({ txId, status, type: TransactionType.WITHDRAW })
  );
  res.status(200).json({ message: "User Withdrawal Request Received" });
});

export default bank;
