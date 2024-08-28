import { Router, json } from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@repo/db";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET as string;
const NEW_USER_BALANCE = 0;
const NEW_BANK_BALANCE = 8000;

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

const auth = Router();
auth.use(json());
auth.use(cookieParser());
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
            firstName,
            lastName,
            email,
            password: hashedPassword,
            userAccount: {
              create: {},
            },
          },
        }),
        prisma.bankUser.create({
          data: {
            email,
            balance: 8000,
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
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

auth.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
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

    const existingUser = await prisma.user.findUnique({
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
              create: {},
            },
          },
        }),
        prisma.bankUser.create({
          data: {
            email,
            balance: 8000,
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
    });
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    res.status(400).json({ message: "Google Signin Failed" });
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
    });
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    res.status(400).json({ message: "Google Signin Failed" });
  }
});

auth.post("/signout", (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error("Error signing out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default auth;
