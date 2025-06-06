import { Router, json } from "express";
import cookieParser from "cookie-parser";
import { Prisma, prisma } from "@repo/db";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const WEB_URL = process.env.WEB_URL ?? "";
const DOMAIN_NAME = WEB_URL.substring(WEB_URL.indexOf(".") + 1);
const NEW_USER_BALANCE = 80000;
const NEW_BANK_BALANCE = 240000;

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

const auth = Router();
auth.use(json());
auth.use(cookieParser());

auth.get("/doc", async (_, res) => {
  const openApiPath = path.join(
    path.resolve("."),
    "src/auth/auth.openapi.yaml"
  );
  res.sendFile(openApiPath);
});

auth.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (password.length < 5)
      return res
        .status(400)
        .json({ message: "Password must be at least 5 characters long" });
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (
      existingUser &&
      (existingUser.password.length >= 5 || existingUser.loginType === "GOOGLE")
    ) {
      return res.status(400).json({ message: "User already exists" });
    }
    let newUserId = existingUser?.id ?? 0;
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (newUserId) {
      //create bank user
      await prisma.bankUser.create({
        data: {
          email,
          balance: NEW_BANK_BALANCE,
        },
      });
    } else {
      // Create new user
      const [newUser] = await prisma.$transaction([
        prisma.user.create({
          data: {
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email,
            password: hashedPassword,
            userAccount: {
              create: {
                balance: NEW_USER_BALANCE,
              },
            },
          },
        }),
        prisma.bankUser.create({
          data: {
            email,
            balance: NEW_BANK_BALANCE,
          },
        }),
      ]);
      newUserId = newUser.id;
    }

    // Generate JWT token
    const token = sign({ userId: newUserId }, JWT_SECRET);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      domain: process.env.NODE_ENV === "production" ? DOMAIN_NAME : undefined,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error signing up user:", error);
    if (
      process.env.NODE_ENV != "test" &&
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        res
          .status(409)
          .json({ message: "A user with this name already exists" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

auth.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!existingUser || !password || password?.length < 5) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = sign({ userId: existingUser.id }, JWT_SECRET);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      domain: process.env.NODE_ENV === "production" ? DOMAIN_NAME : undefined,
    });

    return res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    console.error("Error signing in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

auth.post("/signin/google", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(400).json({ message: "Google Signin Failed" });
  }
  const {
    tokens: { access_token },
  } = await oAuth2Client.getToken(code);
  if (!access_token) {
    return res.status(400).json({ message: "Google Signin Failed" });
  }
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    const { email, name }: { email: string; name: string } = response.data;
    const [firstName, lastName] = name.split(" ");
    if (!email || !firstName || !lastName)
      throw new Error("Invalid Google Signin Data");

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    let userId = -1;
    if (existingUser) {
      userId = existingUser.id;
      if (!existingUser.loginType) {
        await prisma.user.update({
          where: { email },
          data: {
            loginType: "GOOGLE",
          },
        });
      }
    } else {
      const [newUser] = await prisma.$transaction([
        prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: "",
            loginType: "GOOGLE",
            userAccount: {
              create: {
                balance: NEW_USER_BALANCE,
              },
            },
          },
        }),
        prisma.bankUser.create({
          data: {
            email,
            balance: NEW_BANK_BALANCE,
          },
        }),
      ]);
      userId = newUser.id;
    }

    // Generate JWT token
    const token = sign({ userId }, JWT_SECRET);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      domain: process.env.NODE_ENV === "production" ? DOMAIN_NAME : undefined,
    });
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    if (
      process.env.NODE_ENV != "test" &&
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        console.error("User already exists:", error);
        res
          .status(409)
          .json({ message: "A user with this name already exists" });
      } else {
        console.error("Error during Google Signin:", error);
        res.status(400).json({ message: "Google Signin Failed" });
      }
    } else {
      console.error("Internal server error during Google Signin:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

//google login for merchant
auth.post("/access/merchant", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(400).json({ message: "Google Signin Failed" });
  }
  const {
    tokens: { access_token },
  } = await oAuth2Client.getToken(code);
  if (!access_token) {
    return res.status(400).json({ message: "Google Signin Failed" });
  }
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    const { email, name }: { email: string; name: string } = response.data;
    const [firstName, lastName] = name.split(" ");
    if (!email || !firstName || !lastName)
      throw new Error("Invalid Google Signin Data");

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    let userId = -1;
    if (existingUser) {
      userId = existingUser.id;
      if (!existingUser.isMerchant) {
        await prisma.user.update({
          where: { email },
          data: {
            isMerchant: true,
          },
        });
      }
    } else {
      const [newUser] = await prisma.$transaction([
        prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: "",
            isMerchant: true,
            userAccount: {
              create: {},
            },
          },
        }),
      ]);
      userId = newUser.id;
    }

    // Generate JWT token
    const token = sign({ userId }, JWT_SECRET + "__merchant__");

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      domain: process.env.NODE_ENV === "production" ? DOMAIN_NAME : undefined,
    });
    res.status(200).json({ message: "Merchant signed in successfully" });
  } catch (error) {
    if (
      process.env.NODE_ENV != "test" &&
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        res
          .status(409)
          .json({ message: "A user with this name already exists" });
      } else {
        res.status(400).json({ message: "Google Signin Failed" });
      }
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

auth.post("/signout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      domain: process.env.NODE_ENV === "production" ? DOMAIN_NAME : undefined,
    });
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error("Error signing out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default auth;
