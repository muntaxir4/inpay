const { prisma } = require("./client");

async function main() {
  await prisma.user.create({
    data: {
      email: "user@inpay.mallik.tech",
      password: "user1",
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
