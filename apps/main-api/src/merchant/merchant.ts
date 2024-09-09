import { Router, json } from "express";
import { prisma } from "@repo/db";
import cookieParser from "cookie-parser";
import AuthenticateMerchant from "../auth/AuthenticateMerchant";

const merchant = Router();
merchant.use(cookieParser());
merchant.use(json());

merchant.get("/", AuthenticateMerchant, async (req, res) => {
  try {
    const merchant = await prisma.user.findFirst({
      where: { id: req.body.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userAccount: {
          select: {
            balanceM: true,
          },
        },
      },
    });
    res.status(200).json({ message: "Request Successfull", merchant });
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

merchant.get("/analytics", AuthenticateMerchant, async (req, res) => {
  try {
    const analytics = await prisma.merchantTransactions.groupBy({
      by: ["countryCode"],
      where: {
        merchantId: req.body.userId,
      },
      _count: {
        countryCode: true,
      },
    });
    res.status(200).json({ message: "Request Successfull", analytics });
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

merchant.get("/pay-history", AuthenticateMerchant, async (req, res) => {
  try {
    const range = parseInt(req.query.range as string) || 7;
    const nowDate = new Date();
    const transactions = await prisma.merchantTransactions.findMany({
      where: {
        merchantId: req.body.userId,
        date: {
          gte: new Date(nowDate.getTime() - range * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    const payHistory: number[] = [];
    payHistory.length = range;
    payHistory.fill(0);

    let prevPayed = 0;
    let prevDate = transactions[0]?.date ?? nowDate;

    const getDayIndex = (date: Date) => {
      return (
        range -
        1 -
        Math.ceil((nowDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
      );
    };
    let n = transactions.length;
    for (let j = 0; j < n; j++) {
      if (
        transactions[j]?.date.getUTCDate() !== prevDate.getUTCDate() ||
        transactions[j]?.date.getUTCMonth() !== prevDate.getUTCMonth() ||
        transactions[j]?.date.getUTCFullYear() !== prevDate.getUTCFullYear()
      ) {
        payHistory[getDayIndex(prevDate)] = prevPayed;
        prevPayed = transactions[j]?.amount ?? 0;
        prevDate = transactions[j]?.date ?? nowDate;
      } else {
        prevPayed += transactions[j]?.amount ?? 0;
      }
      if (j === n - 1) {
        payHistory[getDayIndex(transactions[j]?.date ?? nowDate)] = prevPayed;
      }
    }

    res.status(200).json({ message: "Request Successfull", payHistory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Request Failed" });
  }
});

export default merchant;
