import express from "express";
import cors from "cors";
import AuthRouter from "./auth/auth";
import rampRouter from "./ramp/ramp";

const app = express();
app.use(
  "/api/v1",
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/ramp", rampRouter);

app.get("/", (_, res) => {
  res.send("Health check succeeded");
});

app
  .listen(3000, () => console.log("Server is running on port 3000"))
  .on("error", (err) => console.error(err));
