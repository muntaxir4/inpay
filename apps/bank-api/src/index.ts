import express from "express";

import hdfcRouter from "./hdfc/hdfc";

const app = express();

app.use("/api/v1/hdfc", hdfcRouter);

app.get("/", (_, res) => {
  res.send("Health check succeeded");
});

app
  .listen(3002, () => console.log("Server is running on port 3002"))
  .on("error", (err) => console.error(err));
