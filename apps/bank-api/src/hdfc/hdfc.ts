import { Router, json } from "express";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  scryptSync,
} from "node:crypto";
import { prisma } from "@repo/db";

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

const hdfc = Router();
hdfc.use(json());

//encrypt and decrypt logic
function encrypt(text: string, key: Buffer) {
  const iv = randomBytes(16); // Generate a random IV
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

hdfc.post("/withdraw/token", async (req, res) => {
  const { txId, webhookUrl, amount, toAcc }: withdrawTokenRequest = req.body;
  const token = encrypt(
    JSON.stringify({ txId, webhookUrl, toAcc, amount }),
    key
  );
  try {
    res.status(200).json({ message: "Withdrawal Request Submitted", token });
  } catch (error) {
    res.status(500).json({ message: "Could not complete request" });
  }
});

hdfc.post("/withdraw", async (req, res) => {
  const { token, fromAcc }: withdrawRequest = req.body;
  const decryptedData = decrypt(token, key);
  const { txId, webhookUrl, toAcc, amount } = JSON.parse(decryptedData);

  async function informWebhook(status: string) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txId, status }),
    });
    console.log(await response.json());
  }
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
    await informWebhook("SUCCESS");
    res.status(200).json({ message: "Withdrawal Request Completed" });
  } catch (error) {
    await informWebhook("FAILED");
    res.status(400).json({ message: "Insufficient HDFC Balance" });
  }
});

export default hdfc;
