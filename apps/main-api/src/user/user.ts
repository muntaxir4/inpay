import { Router, json } from "express";
import { prisma } from "@repo/db";
import cookieParser from "cookie-parser";

import Authenticate from "../auth/Authenticate";
const user = Router();

user.use(json());
user.use(cookieParser());

async function addNamesToId(
  userIdObjArray: { [key: string]: any }[],
  idKey: string
) {
  const cache = {} as {
    [key: number]: { firstName: string; lastName: string };
  };

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
      cache[userIdObj[idKey]] = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      };
    }
    userIdObj["firstName"] = cache[userIdObj[idKey]]?.firstName;
    userIdObj["lastName"] = cache[userIdObj[idKey]]?.lastName;
    if (idKey != "id") {
      userIdObj["id"] = userIdObj[idKey];
      delete userIdObj[idKey];
    }
  }
}

user.get("/", Authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.body.userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userAccount: {
          select: {
            balance: true,
          },
        },
      },
    });
    res.status(200).json({ message: "Request Successful", user });
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
    const interactions = await prisma.userInteractions.findMany({
      where: {
        OR: [{ userId_1: req.body.userId }, { userId_2: req.body.userId }],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        userId_1: true,
        userId_2: true,
      },
    });
    console.log("interacted", interactions);
    const recentInteractions: {
      id: number;
      firstName: string | undefined;
      lastName: string | undefined;
    }[] = await Promise.all(
      interactions.map(async (interaction) => {
        const id =
          interaction.userId_1 === req.body.userId
            ? interaction.userId_2
            : interaction.userId_1;
        const user = await prisma.user.findFirst({
          where: {
            id,
          },
          select: {
            firstName: true,
            lastName: true,
          },
        });
        return {
          id,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      })
    );
    console.log(recentInteractions);

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
      select: {
        type: true,
        amount: true,
        status: true,
        from: true,
      },
    });
    await addNamesToId(transactions, "from");
    transactions.map((tx: any) => {
      if (tx.id == req.body.userId) {
        tx.firstName = "You";
        tx.lastName = "";
      }
      return tx;
    });
    res.status(200).json({ message: "Request Successful", transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

user.post("/send", Authenticate, async (req, res) => {
  try {
    const { to, amount: atmp }: { to: number; amount: string } = req.body;
    const amount = Number(atmp);
    const from = req.body.userId as number;
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
        //create user interaction if does not exist
        const interaction = await prisma.userInteractions.findFirst({
          where: {
            OR: [
              { userId_1: from, userId_2: to },
              { userId_1: to, userId_2: from },
            ],
          },
        });
        await tx.userInteractions.upsert({
          where: {
            id: interaction?.id ?? -1,
          },
          update: {
            updatedAt: new Date(),
          },
          create: {
            userId_1: from,
            userId_2: to,
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

user.get("/bulk", Authenticate, async (req, res) => {
  const { filter: search } = req.query;
  const [filter1, filter2] = String(search || "").split(" ");
  // console.log(filter1, filter2);
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            firstName: {
              contains: filter1 ?? "",
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: filter2 ?? "",
              mode: "insensitive",
            },
          },
        ],
        NOT: {
          id: req.body.userId,
        },
      },
      take: 8,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return res.status(200).json({ message: "Request Successful", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

export default user;
