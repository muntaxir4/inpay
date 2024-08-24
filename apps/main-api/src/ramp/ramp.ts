import { Router, json } from "express";
import axios from "axios";
import { prisma } from "@repo/db";
import cookieParser from "cookie-parser";
import Authenticate from "../auth/Authenticate";
import { generateOTP, transporter } from "../mailto";
import { convertFloatStringToInteger } from "../user/user";

const ramp = Router();
ramp.use(json());
ramp.use(cookieParser());

ramp.post("/hdfc/onramp", Authenticate, async (req, res) => {
  const { amount: amt, userId } = req.body;
  try {
    const amount = convertFloatStringToInteger(amt as string);
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });
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

//off ramp endpoints
ramp.get("/hdfc/offramp/get-otp", Authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    const { amount: amt } = req.query;
    const amount = convertFloatStringToInteger(amt as string);
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = generateOTP();
    await prisma.userOTP.create({
      data: {
        email: user.email,
        otp,
        bank: "INPAY",
      },
    });
    try {
      const fromEmail = process.env.SMTP_USER;
      await transporter.sendMail({
        from: `"inPay" <hq-${fromEmail}>`, // sender address
        to: user.email, // list of receivers
        subject: "One Time Password, InPay", // Subject line
        text: `Your 6 digit OTP for inPay withdrawal to HDFC Demo: ${otp}`, // plain text body
      });
      res.status(200).json({ message: "OTP Sent" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Could not send OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

ramp.post("/hdfc/offramp/verify-otp", Authenticate, async (req, res) => {
  const { amount: amt, userId, otp } = req.body;

  //off ramp function
  async function offRamp(email: string, balance: number = 0) {
    try {
      const amount = convertFloatStringToInteger(amt as string);
      if (amount <= 0) return;
      if (balance < amount) return;
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
      try {
        await axios.post("http://localhost:3002/api/v1/hdfc/deposit", {
          fromAcc: "hdfc@inpay.mallik.tech",
          toAcc: email,
          amount,
          txId: tx.id,
          webhookUrl: "http://localhost:3001/api/v1/bank/withdraw",
        });
      } catch (error) {
        console.error(error);
        await prisma.transactions.update({
          where: {
            id: tx.id,
          },
          data: {
            status: "FAILED",
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  try {
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
    if (!user) return res.status(404).json({ message: "User not found" });
    const userOTP = await prisma.userOTP.findFirst({
      where: {
        email: user.email,
        otp,
        bank: "INPAY",
      },
    });
    if (!userOTP) return res.status(400).json({ message: "Invalid OTP" });
    await prisma.userOTP.delete({
      where: {
        id: userOTP.id,
      },
    });
    res.status(200).json({ message: "Withdrawal Processing" });
    try {
      offRamp(user.email, user.userAccount?.balance);
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

//depricated in future
ramp.post("/hdfc/offramp", Authenticate, async (req, res) => {
  const { amount: amt, userId } = req.body;
  try {
    const amount = Number(amt);
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });
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
