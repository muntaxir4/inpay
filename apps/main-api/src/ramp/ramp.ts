import { Router, json } from "express";
import axios from "axios";
import { prisma } from "@repo/db";

const ramp = Router();
ramp.use(json());

ramp.post("/hdfc/onramp", async (req, res) => {
  const { amount, userId } = req.body;
  try {
    const tx = await prisma.transactions.create({
      data: {
        from: userId,
        amount,
        type: "DEPOSIT",
        status: "PENDING",
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

export default ramp;
