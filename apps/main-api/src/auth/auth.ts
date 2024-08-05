import { Router, json } from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@repo/db";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET ?? "we nee more security";

const auth = Router();
auth.use(json());
auth.use(cookieParser());
auth.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userAccount: {},
      },
    });

    // Generate JWT token
    const token = sign({ userId: newUser.id }, JWT_SECRET);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "PRODUCTION",
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

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
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
      secure: process.env.NODE_ENV === "PRODUCTION",
    });

    return res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    console.error("Error signing in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default auth;
