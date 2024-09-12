import { describe, it, jest, beforeAll, expect, afterAll } from "@jest/globals";
import { prisma } from "@repo/db";
import request from "supertest";
import axios from "axios";

let cookies: string = "";

// Mocking timers. The config fixes prisma transaction issues
jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
import app from "../app";
import { convertFloatStringToInteger, getINRstring } from "./user";

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
    lastName: "1",
    email: "user1@test.com",
    password: "user1",
  });
  await request(app).post("/api/v1/auth/signup").send({
    firstName: "User",
    lastName: "2",
    email: "user2@test.com",
    password: "user2",
  });
  cookies = response.headers["set-cookie"] ?? "";
});

afterAll(async () => {
  jest.clearAllTimers();
});

describe("Fetch User", () => {
  it("should return 401 if the user is not authenticated", async () => {
    const response = await request(app).get("/api/v1/user");
    expect(response.status).toBe(401);
  });

  it("should return the user details if the user is authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/user")
      .set("Cookie", cookies)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Request Successful",
      user: {
        firstName: "User",
        lastName: "1",
        id: 1,
        userAccount: {
          balance: 80000,
          lastSeen: new Date(0).toISOString(),
        },
      },
    });
  });
});

describe("Recently onboarded users", () => {
  it("should return atmost 5 newly signed up users", async () => {
    const response = await request(app)
      .get("/api/v1/user/recent/users")
      .set("Cookie", cookies)
      .send();
    expect(response.status).toBe(200);
    expect(response.body.recentUsers).toEqual([
      { id: 2, firstName: "User", lastName: "2" },
    ]);
  });
});

describe("Send Money", () => {
  it("should return 400 if currency is not provided", async () => {
    const response = await request(app)
      .post("/api/v1/user/send")
      .set("Cookie", cookies)
      .send({
        amount: 1000,
        to: 2,
      });
    expect(response.status).toBe(400);
  });

  it("should return 400 if amount is negative", async () => {
    const response = await request(app)
      .post("/api/v1/user/send")
      .set("Cookie", cookies)
      .send({
        amount: -1000,
        to: 2,
        currency: "INR",
      });
    expect(response.status).toBe(400);
  });

  it("should return 400 if balance is insufficient", async () => {
    const response = await request(app)
      .post("/api/v1/user/send")
      .set("Cookie", cookies)
      .send({
        amount: 100000,
        to: 2,
        currency: "INR",
      });
    expect(response.status).toBe(400);
  });

  it("should be able to send money to another user", async () => {
    const user1Before = await prisma.userAccount.findFirst({
      where: { id: 1 },
    });
    jest.spyOn(axios, "post").mockResolvedValueOnce(true);
    const response = await request(app)
      .post("/api/v1/user/send")
      .set("Cookie", cookies)
      .send({
        amount: 10.0,
        to: 2,
        currency: "INR",
      });
    expect(response.status).toBe(200);
    const user1 = await prisma.userAccount.findFirst({ where: { id: 1 } });
    const user2 = await prisma.userAccount.findFirst({ where: { id: 2 } });
    expect(user1?.balance).toBe(user1Before?.balance! - 1000);
    expect(user2?.balance).toBe(81000);
  });

  it("should be able to send money to another user in a different currency", async () => {
    const user1Before = await prisma.userAccount.findFirst({
      where: { id: 1 },
    });
    jest.spyOn(axios, "post").mockResolvedValueOnce(true);
    const response = await request(app)
      .post("/api/v1/user/send")
      .set("Cookie", cookies)
      .send({
        amount: 5.5,
        to: 2,
        currency: "USD",
      });
    expect(response.status).toBe(200);
    const user1 = await prisma.userAccount.findFirst({ where: { id: 1 } });
    const user2 = await prisma.userAccount.findFirst({ where: { id: 2 } });
    const amount = convertFloatStringToInteger(getINRstring("5.5", "USD"));
    expect(user1?.balance).toBe(user1Before?.balance! - amount);
    expect(user2?.balance).toBe(81000 + amount);
  });
});

describe("User's recently interacted", () => {
  it("should return the recent interactions for the user", async () => {
    const response = await request(app)
      .get("/api/v1/user/recent/interacted")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request Successful");
    expect(response.body.recentInteractions).toEqual([
      { id: 2, firstName: "User", lastName: "2" },
    ]);
  });
});

describe("User's Recent Transactions", () => {
  it("should return the recent transactions for the user", async () => {
    const response = await request(app)
      .get("/api/v1/user/recent/transactions")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request Successful");
    expect(response.body.transactions?.[1]).toEqual({
      id: 1,
      type: "TRANSFER",
      amount: 1000,
      firstName: "You",
      lastName: "",
      status: "SUCCESS",
    });
  });
});

describe("Search Users", () => {
  it("should be able to search for users based on filter", async () => {
    const response = await request(app)
      .get("/api/v1/user/bulk")
      .set("Cookie", cookies)
      .query({ filter: "use" });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request Successful");
    expect(response.body.users).toEqual([
      { id: 2, firstName: "User", lastName: "2" },
    ]);
  });
});

describe("Spend (merchant)", () => {
  it("should return 400 for invalid currency", async () => {
    const response = await request(app)
      .post("/api/v1/user/spend")
      .set("Cookie", cookies)
      .send({
        toEmail: "merchant1@test.com",
        amount: "100",
        currency: "INVALID_CURRENCY",
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid Currency");
  });

  it("should return 400 for insufficient balance", async () => {
    const response = await request(app)
      .post("/api/v1/user/spend")
      .set("Cookie", cookies)
      .send({
        toEmail: "merchant1@test.com",
        amount: "1000000",
        currency: "INR",
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient Balance");
  });

  it("should return 400 for invalid merchant", async () => {
    const response = await request(app)
      .post("/api/v1/user/spend")
      .set("Cookie", cookies)
      .send({
        toEmail: "invalidmerchant@test.com",
        amount: "100",
        currency: "INR",
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid Merchant");
  });

  it("should return 200 for valid request", async () => {
    await prisma.user.update({
      where: { id: 2 },
      data: { isMerchant: true },
    });
    const response = await request(app)
      .post("/api/v1/user/spend")
      .set("Cookie", cookies)
      .send({
        toEmail: "user2@test.com",
        amount: "100",
        currency: "INR",
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request Successful");

    const merchantAcc = await prisma.userAccount.findFirst({
      where: { id: 2 },
    });
    expect(merchantAcc?.balanceM).toBe(10000);
  });
});

describe("Balance history", () => {
  it("should return the balance history for last 30 days for the user", async () => {
    const user1 = await prisma.userAccount.findFirst({ where: { id: 1 } });
    const response = await request(app)
      .get("/api/v1/user/balance-history")
      .set("Cookie", cookies)
      .send();
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request Successful");
    expect(response.body.balanceHistory.length).toBe(30);
    expect(response.body.balanceHistory?.[29]).toBe(user1?.balance);
  });
});
