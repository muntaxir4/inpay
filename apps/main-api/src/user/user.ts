import { Router, json } from "express";
import { prisma } from "@repo/db";

import Authenticate from "../auth/Authenticate";
const user = Router();

user.use(json());

user.get("/", Authenticate, async (req, res) => {
  try {
    const userAcc = await prisma.userAccount.findFirst({
      where: {
        id: req.body.userId,
      },
    });
    res
      .status(200)
      .json({ message: "Request Successful", balance: userAcc?.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

// Recently onboarded users
user.get("/recent/users", Authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.body.userId,
        },
      },
      orderBy: {
        id: "desc",
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });
    res.status(200).json({ message: "Request Successful", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

// Recently interacted users for a user
user.get("/recent/interacted", Authenticate, async (req, res) => {
  try {
    const userInteractions = await prisma.transactions.findMany({
      where: {
        from: req.body.userId,
        to: {
          not: null,
        },
      },
      take: 5,
      orderBy: {
        date: "desc",
      },
      select: {
        to: true,
      },
    });
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userInteractions.map((interaction) => interaction.to) as number[],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });
    res.status(200).json({ message: "Request Successful", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

//Recent transactions for a user
user.get("/recent/transactions", Authenticate, async (req, res) => {
  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [{ from: req.body.userId }, { to: req.body.userId }],
      },
      take: 5,
    });
    res.status(200).json({ message: "Request Successful", transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

user.post("/send", Authenticate, async (req, res) => {
  try {
    const { to, amount } = req.body;
    const from = req.body.userId;
    if (from === to)
      return res.status(400).json({ message: "Cannot send to self" });
    else if (amount <= 0)
      return res.status(400).json({ message: "Invalid Amount" });
    const userAcc = await prisma.userAccount.findFirst({
      where: {
        id: from,
      },
    });
    if (userAcc?.balance && userAcc.balance >= amount) {
      const txId = await prisma.transactions.create({
        data: {
          type: "TRANSFER",
          amount,
          from,
          to,
        },
        select: {
          id: true,
        },
      });
      await prisma.$transaction(async (tx) => {
        const sender = await prisma.userAccount.update({
          where: {
            id: from,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });
        if (sender.balance < 0) {
          await tx.transactions.update({
            where: {
              id: txId.id,
            },
            data: {
              status: "FAILED",
            },
          });
          throw new Error("Insufficient Balance");
        }
        await prisma.userAccount.update({
          where: {
            id: to,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
        await tx.transactions.update({
          where: {
            id: txId.id,
          },
          data: {
            status: "SUCCESS",
          },
        });
      });
      res.status(200).json({ message: "Request Successful" });
    } else {
      res.status(400).json({ message: "Insufficient Balance" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

export default user;
