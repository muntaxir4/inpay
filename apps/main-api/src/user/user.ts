import { Router, json } from "express";
import { prisma } from "@repo/db";
import cookieParser from "cookie-parser";

import Authenticate from "../auth/Authenticate";
import axios from "axios";
import path from "path";
const user = Router();

interface UserFullName {
  firstName: string;
  lastName: string;
}

user.use(json());
user.use(cookieParser());

// Cache for user full name cause it is required at many places
const userFullNameCache = {} as {
  [key: number]: { firstName: string; lastName: string };
};

//clear cache after 1 day
setInterval(
  () => {
    Object.keys(userFullNameCache).forEach((key) => {
      delete userFullNameCache[Number(key)];
    });
  },
  24 * 60 * 60 * 1000
);

export type Currency = "INR" | "USD" | "AED";

export const currencies = {
  INR: { id: 0, rate: 1, symbol: "₹" },
  USD: { id: 1, rate: 0.011906216, symbol: "$" },
  AED: { id: 2, rate: 0.04372558, symbol: "AED" },
};

//converts user id to user full name, and deletes the id key if it is not "id"
async function addNamesToId(
  userIdObjArray: { [key: string]: any }[],
  idKey: string
) {
  for (const userIdObj of userIdObjArray) {
    const id = userIdObj[idKey];
    if (!userFullNameCache[id]) {
      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
        select: {
          firstName: true,
          lastName: true,
        },
      });
      userFullNameCache[id] = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      };
    }
    userIdObj["firstName"] = userFullNameCache[id]?.firstName;
    userIdObj["lastName"] = userFullNameCache[id]?.lastName;
    if (idKey != "id") {
      userIdObj["id"] = id;
      delete userIdObj[idKey];
    }
  }
}

async function getFullName(id: number) {
  if (!userFullNameCache[id]) {
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });
    userFullNameCache[id] = {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    };
  }
  return userFullNameCache[id];
}

//INR float string
export function getINRstring(amount: string, currency: Currency): string {
  if (currency === "INR") return amount;
  const rate = currencies[currency].rate;
  const amountFloat = parseFloat(amount.toString());
  const inrAmount = amountFloat / rate;
  return inrAmount.toString();
}

//remove decimal and convert to integer
export function convertFloatStringToInteger(num: string): number {
  let [integerPartString, fractionalPartString] = num.toString().split(".");
  fractionalPartString = fractionalPartString?.substring(0, 2).padEnd(2, "0");
  const integerPart = Number(integerPartString ?? 0);
  const fractionalPart = Number(fractionalPartString ?? 0);
  return integerPart * 100 + fractionalPart;
}

user.get("/doc", async (_, res) => {
  const openApiPath = path.join(
    path.resolve("."),
    "src/user/user.openapi.yaml"
  );
  res.sendFile(openApiPath);
});

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
            lastSeen: true,
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

        const user = await getFullName(id);
        return {
          id,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      })
    );
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
  async function informWebsocket(from: number, to: number, amount: number) {
    const WEBSOCKET_URL = process.env.WEBSOCKET_URL as string;
    try {
      await axios.post(WEBSOCKET_URL + "/transferDone", { from, to, amount });
    } catch (error) {
      console.error("Error informing Websoket about transfer", error);
      try {
        await prisma.userMessages.create({
          data: {
            from: Number(from),
            to: Number(to),
            message: `${amount}`,
            isPayment: true,
            createdAt: new Date(),
          },
        });
      } catch {}
    }
  }

  try {
    const {
      to,
      amount: atmp,
      currency,
    }: { to: number; amount: string; currency: Currency } = req.body;
    if (!currency || !currencies[currency])
      return res.status(400).json({ message: "Invalid Currency" });
    const amount = convertFloatStringToInteger(getINRstring(atmp, currency));
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
        const sender = await tx.userAccount.update({
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
          await prisma.transactions.update({
            where: {
              id: txId.id,
            },
            data: {
              status: "FAILED",
            },
          });
          throw new Error("Insufficient Balance");
        }
        await tx.userAccount.update({
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
      informWebsocket(from, to, amount);
    } else {
      res.status(400).json({ message: "Insufficient Balance" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

//searches users based on filter
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

//gets all user interactions for chat
user.get("/interactions", Authenticate, async (req, res) => {
  try {
    const interactionsTmp = await prisma.userInteractions.findMany({
      where: {
        OR: [{ userId_1: req.body.userId }, { userId_2: req.body.userId }],
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        userId_1: true,
        userId_2: true,
        updatedAt: true,
      },
    });

    const interactions = await Promise.all(
      interactionsTmp.map(async (interaction) => {
        const id =
          interaction.userId_1 === req.body.userId
            ? interaction.userId_2
            : interaction.userId_1;

        const user = await getFullName(id);
        return {
          id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          updatedAt: interaction.updatedAt,
        };
      })
    );

    res.status(200).json({ message: "Request Successful", interactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

//gets total pages for transactions
user.get("/transactions/pages", Authenticate, async (req, res) => {
  const { type } = req.query;
  const typeFilter =
    typeof type === "string" ? [type] : Array.isArray(type) ? type : [];

  try {
    const totalTransactions = await prisma.transactions.count({
      where: {
        OR: [{ from: req.body.userId }, { to: req.body.userId }],
        // @ts-ignore
        type:
          typeFilter.length === 0
            ? {}
            : {
                in: typeFilter,
              },
      },
    });
    res.status(200).json({
      message: "Request Successful",
      pages: Math.ceil(totalTransactions / 10),
    });
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

//gets paginated transactions
user.get("/transactions", Authenticate, async (req, res) => {
  //page index starts from 1
  const { page = 1, type } = req.query;
  const typeFilter =
    typeof type === "string" ? [type] : Array.isArray(type) ? type : [];

  try {
    const allTransactions = await prisma.transactions.findMany({
      where: {
        OR: [{ from: req.body.userId }, { to: req.body.userId }],
        // @ts-ignore
        type:
          typeFilter.length === 0
            ? {}
            : {
                in: typeFilter,
              },
      },
      skip: (Number(page) - 1) * 10,
      take: 10,
      orderBy: {
        date: "desc",
      },
    });
    //changes from and to numbers to fullname strings
    const transactions = await Promise.all(
      allTransactions.map(async (tx) => {
        const newTx = { ...tx } as any;
        if (newTx.from !== req.body.userId) {
          const user = await getFullName(newTx.from);
          newTx.from = user.firstName + " " + user.lastName;
        } else {
          newTx.from = "You";
        }

        if (newTx.to !== req.body.userId && newTx.to) {
          const user = await getFullName(newTx.to);
          newTx.to = user.firstName + " " + user.lastName;
        } else {
          if (newTx.type === "SPENT") newTx.to = "Merchant";
          else newTx.to = "You";
        }
        return newTx;
      })
    );
    res.status(200).json({ message: "Request Successful", transactions });
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

//pay merchant
user.post("/spend", Authenticate, async (req, res) => {
  const {
    toEmail,
    amount: atmp,
    currency,
  }: { toEmail: string; amount: string; currency: Currency } = req.body;
  try {
    if (!currency || !currencies[currency])
      return res.status(400).json({ message: "Invalid Currency" });
    const amount = convertFloatStringToInteger(getINRstring(atmp, currency));
    if (amount <= 0 || !toEmail)
      return res.status(400).json({ message: "Invalid Data" });
    const fromId = req.body.userId;
    const userAcc = await prisma.userAccount.findFirst({
      where: {
        id: fromId,
      },
    });
    if (userAcc?.balance && userAcc.balance < amount)
      return res.status(400).json({ message: "Insufficient Balance" });
    const to = await prisma.user.findFirst({
      where: {
        email: toEmail,
      },
      select: {
        id: true,
      },
    });
    // to.isMerchant = false
    if (!to) return res.status(400).json({ message: "Invalid Merchant" });
    const txId = await prisma.transactions.create({
      data: {
        type: "SPENT",
        amount,
        from: fromId,
      },
      select: {
        id: true,
      },
    });

    let countryCode = "IN";
    try {
      //get country code
      const ipData = await axios.get(
        `http://ip-api.com/json/${req.socket.remoteAddress}?fields=status,countryCode`
      );
      if (ipData.data.status === "fail") ipData.data.countryCode = "IN";
      countryCode = ipData.data.countryCode;
    } catch {
      console.error("Error getting country code");
    }

    try {
      await prisma.$transaction(async (tx) => {
        const sender = await tx.userAccount.update({
          where: {
            id: fromId,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });
        if (sender.balance < 0) {
          await prisma.transactions.update({
            where: {
              id: txId.id,
            },
            data: {
              status: "FAILED",
            },
          });
          throw new Error("Insufficient Balance");
        }
        await tx.userAccount.update({
          where: {
            id: to.id,
          },
          data: {
            balanceM: {
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

        await tx.merchantTransactions.create({
          data: {
            merchantId: to.id,
            amount,
            countryCode: countryCode,
          },
        });
      });
      res.status(200).json({ message: "Request Successful" });
    } catch (error) {
      await prisma.transactions.update({
        where: {
          id: txId.id,
        },
        data: {
          status: "FAILED",
        },
      });
      return res.status(500).json({ message: "Request Failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

//get balance history
user.get("/balance-history", Authenticate, async (req, res) => {
  try {
    const userAcc = await prisma.userAccount.findFirst({
      where: {
        id: req.body.userId,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    const nowDate = new Date();

    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [{ from: req.body.userId }, { to: req.body.userId }],
        status: "SUCCESS",
        date: {
          gte: new Date(nowDate.getTime() - 29 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const balanceHistory: number[] = [];
    balanceHistory.length = 30;
    const firstTransaction = await prisma.transactions.findFirst({
      where: {
        OR: [{ from: req.body.userId }, { to: req.body.userId }],
        status: "SUCCESS",
      },
    });

    const getIndexFromDate = (date: Date | undefined) => {
      if (date === undefined) return 29;
      else if (
        nowDate.getUTCDate() === date.getUTCDate() &&
        nowDate.getUTCMonth() === date.getUTCMonth()
      )
        return 29;
      return (
        29 -
        Math.ceil((nowDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
      );
    };
    const firstTxDay = getIndexFromDate(firstTransaction?.date);

    //last transaction day from today
    let k = getIndexFromDate(transactions[transactions.length - 1]?.date);
    let i = k,
      j = transactions.length - 1;
    balanceHistory.fill(userAcc?.balance || 0, i, 30);
    balanceHistory[i--] = userAcc?.balance || 0;

    let prevDate = transactions[transactions.length - 1]?.date;
    let currDayBalance = userAcc?.balance || 0;

    const transactionTypes = {
      DEPOSIT: 0,
      WITHDRAW: 0,
      RECEIVED: 0,
      SENT: 0,
      SPENT: 0,
    };

    for (; i >= 0 && j >= 0; j--) {
      const txType = transactions[j]?.type ?? "TRANSFER";
      if (txType === "DEPOSIT") {
        currDayBalance -= transactions[j]?.amount || 0;
        transactionTypes.DEPOSIT += 1;
      } else if (txType === "WITHDRAW") {
        currDayBalance += transactions[j]?.amount || 0;
        transactionTypes.WITHDRAW += 1;
      } else if (txType === "TRANSFER") {
        if (transactions[j]?.from === req.body.userId) {
          currDayBalance += transactions[j]?.amount || 0;
          transactionTypes.SENT += 1;
        } else {
          currDayBalance -= transactions[j]?.amount || 0;
          transactionTypes.RECEIVED += 1;
        }
      } else if (txType === "SPENT") {
        currDayBalance += transactions[j]?.amount || 0;
        transactionTypes.SPENT += 1;
      }
      if (
        transactions[j]?.date.getUTCDate() !== prevDate?.getUTCDate() ||
        transactions[j]?.date.getUTCMonth() !== prevDate?.getUTCMonth() ||
        transactions[j]?.date.getUTCFullYear() !== prevDate?.getUTCFullYear() ||
        j == 0
      ) {
        let iNew = getIndexFromDate(transactions[j]?.date);
        for (let iStart = iNew; iStart <= i; iStart++) {
          balanceHistory[iStart] = currDayBalance;
        }
        i = iNew - 1;
        prevDate = transactions[j]?.date;
      }
    }
    let l = firstTxDay;
    if (l <= 0) balanceHistory.fill(currDayBalance, 0, i);
    else {
      balanceHistory.fill(0, 0, l);
      balanceHistory.fill(currDayBalance, l, i + 1);
    }
    res.status(200).json({
      message: "Request Successful",
      balanceHistory,
      transactionTypes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

export default user;
