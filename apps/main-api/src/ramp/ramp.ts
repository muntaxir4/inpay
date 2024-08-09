import { Router, json } from "express";
import axios from "axios";
import { prisma } from "@repo/db";
import cookieParser from "cookie-parser";
import Authenticate from "../auth/Authenticate";

const ramp = Router();
ramp.use(json());
ramp.use(cookieParser());

ramp.post("/hdfc/onramp", Authenticate, async (req, res) => {
  const { amount: amt, userId } = req.body;
  try {
    const amount = Number(amt);
    const tx = await prisma.transactions.create({
      data: {
        from: userId,
        amount,
        type: "DEPOSIT",
      },
      select: {
        id: true,
      },
    });
    try {
      const response = await axios.post(
        "http://localhost:3002/api/v1/hdfc/withdraw/token",
        {
          txId: tx.id,
          webhookUrl: "http://localhost:3001/api/v1/bank/deposit",
          toAcc: "hdfc@inpay.mallik.tech",
          amount,
        }
      );
      res
        .status(200)
        .json({ message: "Request Successful", token: response.data.token });
    } catch (error) {
      console.error(error);
      await prisma.transactions.delete({
        where: {
          id: tx.id,
        },
      });
      res.status(500).json({ message: "Request Failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

ramp.post("/hdfc/offramp", Authenticate, async (req, res) => {
  const { amount: amt, userId } = req.body;
  try {
    const amount = Number(amt);
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
        userAccount: {
          select: {
            balance: true,
          },
        },
      },
    });
    if (!user) throw "User not found";
    if (user.userAccount && user.userAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient Balance" });
    }
    const tx = await prisma.transactions.create({
      data: {
        from: userId,
        amount,
        type: "WITHDRAW",
      },
      select: {
        id: true,
      },
    });

    await axios.post("http://localhost:3002/api/v1/hdfc/deposit", {
      fromAcc: "hdfc@inpay.mallik.tech",
      toAcc: user.email,
      amount,
      txId: tx.id,
      webhookUrl: "http://localhost:3001/api/v1/bank/withdraw",
    });
    res.status(200).json({ message: "Request Successful" });
  } catch (error) {
    if (error === "User not found")
      return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: "Request Failed" });
  }
});

export default ramp;
