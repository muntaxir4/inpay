import { jest } from "@jest/globals";
const prisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  bankUser: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

declare namespace Prisma {
  export { PrismaClientKnownRequestError };
}

export { Prisma, prisma };
