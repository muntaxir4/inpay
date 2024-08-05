import { Router, json } from "express";
import { prisma } from "@repo/db";
const user = Router();

user.use(json());

user.get("/", async (req, res) => {
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
user.get("/recent/users", async (req, res) => {
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
user.get("/recent/interacted", async (req, res) => {
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
user.get("/recent/transactions", async (req, res) => {
  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        from: req.body.userId,
      },
      take: 5,
    });
    res.status(200).json({ message: "Request Successful", transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

export default user;
