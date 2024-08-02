import express from "express";

import bankRouter from "./bank";

const app = express();
const PORT = 3001;

app.use("/api/v1/bank", bankRouter);

app.get("/", (_, res) => {
  res.send("Health check succeeded");
});

app
  .listen(PORT, () => console.log("Server is running on port", PORT))
  .on("error", (err) => console.error(err));
