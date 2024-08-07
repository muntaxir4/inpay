import express from "express";
import cors from "cors";
import AuthRouter from "./auth/auth";
import UserRouter from "./user/user";
import rampRouter from "./ramp/ramp";

const app = express();
app.use(
  "/api/v1",
  cors({
    credentials: true,
    origin: process.env.WEB_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/ramp", rampRouter);

app.get("/", (_, res) => {
  res.send("Health check succeeded");
});

app
  .listen(3000, () => console.log("Server is running on port 3000"))
  .on("error", (err) => console.error(err));
