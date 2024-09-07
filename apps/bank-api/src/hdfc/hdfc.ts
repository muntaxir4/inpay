import { Router, json } from "express";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  scryptSync,
} from "node:crypto";
import { prisma } from "@repo/db";
import axios from "axios";
import { transporter, generateOTP } from "../mailto";

interface withdrawTokenRequest {
  txId: string;
  webhookUrl: string;
  amount: number;
  toAcc: string; //email
}

interface withdrawRequest {
  token: string;
  fromAcc: string; //email
}

interface depositRequest {
  fromAcc: string; //email
  toAcc: string; //email
  amount: number;
  txId: string;
  webhookUrl: string;
}

const hdfc = Router();
hdfc.use(json());

const fromEmail = process.env.SMTP_HDFC_MAIL as string;

//encrypt and decrypt logic
function encrypt(text: string, key: Buffer) {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-128-cbc", key, iv);
  let encryptedData = cipher.update(text, "utf8", "base64");
  encryptedData += cipher.final("base64");
  return iv.toString("hex") + encryptedData;
}

function decrypt(encryptedData: string, key: Buffer) {
  const iv = Buffer.from(encryptedData.substring(0, 32), "hex");
  const encryptedText = encryptedData.substring(32);
  const decipher = createDecipheriv("aes-128-cbc", key, iv);
  let decryptedData = decipher.update(encryptedText, "base64", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
}

// const plaintext = JSON.stringify({txId: "e7a294f2-4380-40e4-bffb-8493a3fe4cf9", toAcc:"bank@inpay.mallik.tech"});
const password = "MOON CRATERS";
const key = scryptSync(password, "salt", 16);
// const encData= encrypt(plaintext,key);
// console.log(encData);
// const decData= decrypt(encData,key)
// console.log(decData);
//

hdfc.post("/verify/email", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await prisma.bankUser.findFirst({
      where: {
        email,
      },
    });
    if (!user) return res.status(400).json({ message: "Email not found" });
    //generate otp
    const otp = generateOTP();
    const { id } = await prisma.userOTP.create({
      data: {
        email,
        otp,
        bank: "HDFC",
      },
    });
    //send email
    try {
      if (process.env.NODE_ENV === "production") {
        await transporter.sendMail({
          from: `"HDFC DEMO" <${fromEmail}>`, // sender address
          to: email, // list of receivers
          subject: "One Time Password, InPay", // Subject line
          text: `Your 6 digit OTP for HDFC Demo withdrawal to Inpay: ${otp}`, // plain text body
        });
      } else {
        console.log(
          `Your 6 digit OTP for HDFC Demo withdrawal to Inpay: ${otp}`
        );
      }
      res.status(200).json({ message: "Email Found", balance: user.balance });
    } catch (error) {
      await prisma.userOTP.delete({
        where: {
          id,
        },
      });
      console.error(error);
      return res.status(500).json({ message: "Could not send OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

hdfc.post("/verify/otp", async (req, res) => {
  const { email, otp, token } = req.body;

  //withdraw logic
  async function withdraw(tokenEncoded: string, fromAcc: string) {
    const token = decodeURIComponent(tokenEncoded);
    // console.log(token);
    const decryptedData = decrypt(token, key);
    const { txId, webhookUrl, toAcc, amount } = JSON.parse(decryptedData);

    try {
      const user = await prisma.bankUser.findFirst({
        where: {
          email: fromAcc,
        },
        select: {
          balance: true,
        },
      });
      if (!user || user.balance < amount) throw "Insufficient HDFC balance";

      await prisma.$transaction([
        prisma.bankUser.update({
          where: {
            email: fromAcc,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        }),
        prisma.bankUser.update({
          where: {
            email: toAcc,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        }),
      ]);
      await prisma.bankTokens.deleteMany({
        where: {
          token,
          bank: "HDFC",
        },
      });
      await informWebhook(webhookUrl, txId, "SUCCESS");
    } catch (error) {
      await informWebhook(webhookUrl, txId, "FAILED");
    }
  }
  try {
    const userOTP = await prisma.userOTP.findFirst({
      where: {
        email,
        otp,
        bank: "HDFC",
      },
    });
    if (!userOTP) return res.status(400).json({ message: "Invalid OTP" });
    await prisma.userOTP.delete({
      where: {
        id: userOTP.id,
      },
    });
    res.status(200).json({ message: "OTP Verified" });
    await withdraw(token, email);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Request Failed" });
  }
});

hdfc.post("/verify/bank-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Invalid Token" });
    const bankToken = await prisma.bankTokens.findFirst({
      where: {
        token: decodeURIComponent(token),
        bank: "HDFC",
      },
    });
    if (!bankToken) return res.status(400).json({ message: "Invalid Token" });
    res.status(200).json({ message: "Token Verified" });
  } catch (error) {
    res.status(500).json({ message: "Request Failed" });
  }
});

hdfc.post("/withdraw/token", async (req, res) => {
  const { txId, webhookUrl, amount, toAcc }: withdrawTokenRequest = req.body;
  const token = encrypt(
    JSON.stringify({ txId, webhookUrl, toAcc, amount }),
    key
  );
  try {
    await prisma.bankTokens.create({
      data: {
        token,
        bank: "HDFC",
      },
    });
    res.status(200).json({ message: "Withdrawal Request Submitted", token });
  } catch (error) {
    res.status(500).json({ message: "Could not complete request" });
  }
});

async function informWebhook(webhookUrl: string, txId: string, status: string) {
  const response = await axios.post(webhookUrl, { txId, status });
  // console.log(response.data);
}

//depricated in future
hdfc.post("/withdraw", async (req, res) => {
  const { token, fromAcc }: withdrawRequest = req.body;
  const decryptedData = decrypt(token, key);
  const { txId, webhookUrl, toAcc, amount } = JSON.parse(decryptedData);

  try {
    const user = await prisma.bankUser.findFirst({
      where: {
        email: fromAcc,
      },
      select: {
        balance: true,
      },
    });
    if (!user || user.balance < amount) throw "Insufficient HDFC balance";

    await prisma.$transaction([
      prisma.bankUser.update({
        where: {
          email: fromAcc,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
      prisma.bankUser.update({
        where: {
          email: toAcc,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      }),
    ]);
    await informWebhook(webhookUrl, txId, "SUCCESS");
    res.status(200).json({ message: "Withdrawal Request Completed" });
  } catch (error) {
    await informWebhook(webhookUrl, txId, "FAILED");
    res.status(400).json({ message: "Insufficient HDFC Balance" });
  }
});

hdfc.post("/deposit", async (req, res) => {
  const { fromAcc, toAcc, amount, txId, webhookUrl }: depositRequest = req.body;
  try {
    await prisma.$transaction([
      prisma.bankUser.update({
        where: {
          email: fromAcc,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
      prisma.bankUser.update({
        where: {
          email: toAcc,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      }),
    ]);
    await informWebhook(webhookUrl, txId, "SUCCESS");
    res.status(200).json({ message: "Deposit Request Completed" });
  } catch (error) {
    await informWebhook(webhookUrl, txId, "FAILED");
    res.status(400).json({ message: "Deposit Request Failed" });
  }
});

export default hdfc;
