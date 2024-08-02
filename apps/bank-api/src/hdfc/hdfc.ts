import { Router, json } from "express";

const hdfc = Router();
hdfc.use(json());

hdfc.post("/withdraw", async (req, res) => {
  const { txId } = req.body;
  console.log(`Withdrawing from HDFC for txId: ${txId}`);
  res.status(200).json({ message: "Withdrawal Request Submitted" });

  setTimeout(() => {
    async function main() {
      const response = await fetch(
        "http://localhost:3001/api/v1/bank/deposit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ txId, status: "SUCCESS" }),
        }
      );
      console.log(response);
    }
    main();
  }, 1500);
});

export default hdfc;
