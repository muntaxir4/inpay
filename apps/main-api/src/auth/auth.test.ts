import { describe, it, expect, afterAll, jest } from "@jest/globals";
import request from "supertest";
import { prisma } from "@repo/db/mocked";
import axios from "axios";

const bcrypt = {
  hash: jest.fn().mockReturnValue(Promise.resolve("hashedPassword")),
  compare: jest.fn(),
};
jest.useFakeTimers();

jest.mock("@repo/db", () => require("@repo/db/mocked"));

jest.mock("bcrypt", () => {
  return bcrypt;
});

jest.mock("jsonwebtoken", () => {
  return {
    sign: jest.fn().mockReturnValue(Promise.resolve("token")),
  };
});

jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        getToken: jest
          .fn()
          .mockReturnValue(
            Promise.resolve({ tokens: { access_token: "valid_access_token" } })
          ),
      };
    }),
  };
});

//import later due to Referrence error
import app from "../app";

afterAll(() => {
  jest.clearAllTimers();
});

describe("Signup test", () => {
  it("should return 400 if password is less than 5 characters", async () => {
    const response = await request(app).post("/api/v1/auth/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@email.com",
      password: "1234",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password must be at least 5 characters long"
    );
  });

  it("should return 400 if user already exists and there is a password or login type GOOGLE", async () => {
    prisma.user.findFirst.mockReturnValueOnce({
      id: 2,
      password: "password",
    });
    const response = await request(app).post("/api/v1/auth/signup").send({
      firstName: "John",
      lastName: "Dev",
      email: "johndev@email.com",
      password: "12345",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should create a new user if user does not exist", async () => {
    prisma.user.findFirst.mockReturnValueOnce(null);
    prisma.$transaction.mockReturnValueOnce([1, 1]);
    const response = await request(app).post("/api/v1/auth/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@email.com",
      password: "12345",
    });
    expect(response.status).toBe(201);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should create a bank user if user already a merchant", async () => {
    prisma.user.findFirst.mockReturnValueOnce({
      id: 2,
      password: "",
      loginType: null,
    });
    prisma.bankUser.create.mockReturnValueOnce(1);

    const response = await request(app).post("/api/v1/auth/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@mail.com",
      password: "12345",
    });
    expect(response.status).toBe(201);
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});

describe("Signin", () => {
  it("should return 400 if user does not exist", async () => {
    prisma.user.findFirst.mockReturnValueOnce(null);
    const response = await request(app).post("/api/v1/auth/signin").send({
      email: "johndev@mail.com",
      password: "password",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 400 if no password or password of length less than 5 is provided", async () => {
    prisma.user.findFirst.mockReturnValueOnce(null);

    const response = await request(app).post("/api/v1/auth/signin").send({
      email: "johndev@mail.com",
      password: "hack",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User not found");
  });

  it("should not be able to login if password does not match", async () => {
    prisma.user.findFirst.mockReturnValueOnce({
      email: "johndoe@mail.com",
      password: "12345",
    });
    bcrypt.compare.mockReturnValueOnce(false);
    const response = await request(app).post("/api/v1/auth/signin").send({
      email: "johndoe@mail.com",
      password: "hack12345",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should be able to login", async () => {
    prisma.user.findFirst.mockReturnValueOnce({
      id: 1,
      email: "johndoe@mail.com",
      password: "password",
    });
    bcrypt.compare.mockReturnValueOnce(Promise.resolve(true));
    const response = await request(app).post("/api/v1/auth/signin").send({
      email: "johndoe@mail.com",
      password: "password",
    });
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});

describe("Google Signin", () => {
  it("should return 400 if code is not provided", async () => {
    const response = await request(app)
      .post("/api/v1/auth/signin/google")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Google Signin Failed");
  });

  it("should create a new user if user does not exist", async () => {
    const code = "valid_code";
    const email = "johndoe@gmail.com";
    const name = "John Doe";
    const firstName = "John";
    const lastName = "Doe";
    jest.spyOn(axios, "get").mockResolvedValueOnce({
      data: { email, name },
    });
    prisma.user.findFirst.mockReturnValueOnce(null);
    prisma.$transaction.mockReturnValueOnce([{ id: 1 }]);
    const response = await request(app)
      .post("/api/v1/auth/signin/google")
      .send({ code });
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalledWith({
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
    });
  });

  it("should update loginType if user already exists", async () => {
    const code = "valid_code";
    const email = "johndoe@gmail.com";
    const name = "John Doe";
    jest.spyOn(axios, "get").mockResolvedValueOnce({
      data: { email, name },
    });
    prisma.user.findFirst.mockReturnValueOnce({ id: 1 });
    const response = await request(app)
      .post("/api/v1/auth/signin/google")
      .send({
        code,
      });
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email },
      data: {
        loginType: "GOOGLE",
      },
    });
  });
});

describe("Google Merchant Signin", () => {
  it("should return 400 if code is not provided", async () => {
    const response = await request(app)
      .post("/api/v1/auth/access/merchant")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Google Signin Failed");
  });

  it("should create a new user if user does not exist", async () => {
    const code = "valid_code";
    const email = "johndoe@gmail.com";
    const name = "John Doe";
    const firstName = "John";
    const lastName = "Doe";
    jest.spyOn(axios, "get").mockResolvedValueOnce({
      data: { email, name },
    });
    prisma.user.findFirst.mockReturnValueOnce(null);
    prisma.$transaction.mockReturnValueOnce([{ id: 1 }]);
    const response = await request(app)
      .post("/api/v1/auth/access/merchant")
      .send({
        code,
      });
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalledWith({
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
    });
  });

  it("should update isMerchant if user already exists", async () => {
    const code = "valid_code";
    const email = "johndoe@gmail.com";
    const name = "John Doe";
    jest.spyOn(axios, "get").mockResolvedValueOnce({
      data: { email, name },
    });
    prisma.user.findFirst.mockReturnValueOnce({ id: 1 });
    const response = await request(app)
      .post("/api/v1/auth/access/merchant")
      .send({
        code,
      });
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email },
      data: {
        isMerchant: true,
      },
    });
  });
});

describe("Signout", () => {
  it("should clear the token cookie and return a success message", async () => {
    const response = await request(app).post("/api/v1/auth/signout");
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]?.[0]).toContain(
      "token=; Path=/; Expires="
    );
    expect(response.body.message).toBe("User signed out successfully");
  });
});
