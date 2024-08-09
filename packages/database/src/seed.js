const { prisma } = require("./client");

async function main() {
  await prisma.bankUser.create({
    data: {
      email: "hdfc@inpay.mallik.tech",
      balance: 1000,
    },
  });
}

main();
