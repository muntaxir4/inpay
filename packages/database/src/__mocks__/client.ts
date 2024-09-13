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

declare namespace Prisma {
  export class PrismaClientKnownRequestError extends Error {}
}

export { Prisma, prisma };
