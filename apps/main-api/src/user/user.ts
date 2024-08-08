import { Router, json } from "express";
import { prisma } from "@repo/db";
import cookieParser from "cookie-parser";

import Authenticate from "../auth/Authenticate";
const user = Router();

user.use(json());
user.use(cookieParser());

async function addUsernamesToId(
  userIdObjArray: { [key: string]: any }[],
  idKey: string
) {
  const cache = {} as { [key: number]: string };

  for (const userIdObj of userIdObjArray) {
    if (!cache[userIdObj[idKey]]) {
      const user = await prisma.user.findFirst({
        where: {
          id: userIdObj[idKey],
        },
        select: {
          firstName: true,
          lastName: true,
        },
      });
      cache[userIdObj[idKey]] = `${user?.firstName} ${user?.lastName}`;
    }
    userIdObj["name"] = cache[userIdObj[idKey]];
    userIdObj["id"] = userIdObj[idKey];
    delete userIdObj[idKey];
  }
}

user.get("/", Authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.body.userId,
      },
      select: {
        firstName: true,
        lastName: true,
        userAccount: {
          select: {
            balance: true,
          },
        },
      },
    });
    res.status(200).json({ message: "Request Successful", balance: user });
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
    const recentUsers = users.map((user) => {
      return {
        id: user.id,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      };
    });
    res.status(200).json({ message: "Request Successful", recentUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

// Recently interacted users for a user
user.get("/recent/interacted", Authenticate, async (req, res) => {
  try {
    const recentInteractions = [] as {
      id: number;
      firstName: string;
      lastName: string;
    }[];
    const len = 5;
    const cache = {} as { [key: number]: boolean };
    let skipTimes = 0;
    while (recentInteractions.length < len) {
      const interactions = await prisma.transactions.findMany({
        where: {
          from: req.body.userId,
          to: {
            not: null,
          },
        },
        skip: skipTimes++ * 10,
        take: 10,
        orderBy: {
          date: "desc",
        },
        select: {
          to: true,
        },
      });
      if (interactions.length === 0) break;
      for (
        let i = 0;
        recentInteractions.length < len && i < interactions.length;
        i++
      ) {
        const userId = interactions[i]?.to as number;
        if (!cache[userId]) {
          const user = await prisma.user.findFirst({
            where: {
              id: userId,
            },
            select: {
              firstName: true,
              lastName: true,
            },
          });
          cache[userId] = true;
          recentInteractions.push({
            id: userId,
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
          });
        }
      }
    }

    res.status(200).json({ message: "Request Successful", recentInteractions });
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
      orderBy: {
        date: "desc",
      },
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
