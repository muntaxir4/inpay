const { prisma } = require("./client");

async function main() {
  await prisma.user.create({
    data: {
      firstName: "User",
      lastName: "1",
      email: "user@inpay.mallik.tech",
      password: "$2b$10$45J3z7n0Iw1mEONckWq8ZuGohOIln.WQEHfyPPUJCg.6TwTCSMkGC",
      userAccount: {
        create: {},
      },
    },
  });

  await prisma.bankUser.createMany({
    data: [
      {
        email: "user@inpay.mallik.tech",
        balance: 8500,
      },
      {
        email: "hdfc@inpay.mallik.tech",
        balance: 1000,
      },
    ],
  });
}

main();
