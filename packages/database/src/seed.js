const { prisma } = require("./client");

async function main() {
  await prisma.bankUser.upsert({
    where: {
      email: "hdfc@inpay.mallik.tech",
    },
    update: {
      balance: 1000,
    },
    create: {
      email: "hdfc@inpay.mallik.tech",
      balance: 1000,
    },
  });
}

main();
