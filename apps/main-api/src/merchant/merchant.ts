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
      _count: {
        countryCode: true,
      },
    });
    res.status(200).json({ message: "Request Successfull", analytics });
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

export default merchant;
