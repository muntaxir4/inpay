import { describe, it, jest, beforeAll, expect, afterAll } from "@jest/globals";
import { prisma } from "@repo/db";
import request from "supertest";
import axios from "axios";

let cookies: string = "";

// Mocking timers. The config fixes prisma transaction issues
jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
import app from "../app";

async function truncateTables() {
  await prisma.userAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.transactions.deleteMany();
  await prisma.userMessages.deleteMany();
  await prisma.userInteractions.deleteMany();
  await prisma.bankUser.deleteMany();
}

beforeAll(async () => {
  await truncateTables();
  const response = await request(app).post("/api/v1/auth/signup").send({
    firstName: "User",
    lastName: "3",
    email: "user3@test.com",
    password: "user3",
  });
  cookies = response.headers["set-cookie"] ?? "";
});

afterAll(async () => {
  jest.clearAllTimers();
});

describe("On ramp ", () => {
  it("should return 400 if currency is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/ramp/hdfc/onramp")
      .send({
        amount: "1",
        userId: 1,
        currency: "INVALID",
      })
      .set("Cookie", cookies);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid currency");
  });

  it("should return 400 if amount is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/ramp/hdfc/onramp")
      .send({
        amount: "-100",
        userId: 1,
        currency: "USD",
      })
      .set("Cookie", cookies);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid amount");
  });

  it("should return bank token if request is successful", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        token: "bank_token",
      },
    });
    const response = await request(app)
      .post("/api/v1/ramp/hdfc/onramp")
      .send({
        amount: "1",
        currency: "INR",
      })
      .set("Cookie", cookies);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request Successful");
    expect(response.body.token).toEqual("bank_token");
  });
});

describe("Off Ramp", () => {
  it("should return 400 if amount is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/ramp/hdfc/offramp/get-otp")
      .query({
        amount: "-100",
      })
      .set("Cookie", cookies);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid amount");
  });

  it("should send OTP if request is successful", async () => {
    const response = await request(app)
      .get("/api/v1/ramp/hdfc/offramp/get-otp")
      .query({
        amount: "100",
      })
      .set("Cookie", cookies);
    expect(response.status).toBe(200);
  });

  it("should be able to verify OTP", async () => {
    const userOTP = await prisma.userOTP.findFirst();
    jest.spyOn(axios, "post").mockResolvedValueOnce(true);
    const response = await request(app)
      .post("/api/v1/ramp/hdfc/offramp/verify-otp")
      .send({
        otp: userOTP?.otp,
        amount: "100",
        currency: "INR",
      })
      .set("Cookie", cookies);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Withdrawal Processing");
  });
});
