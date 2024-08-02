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
      await axios.post("http://localhost:3002/api/v1/hdfc/withdraw", {
        txId: tx.id,
      });
      res.status(200).json({ message: "Request Successful" });
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
