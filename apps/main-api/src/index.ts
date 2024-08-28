import express from "express";
import cors from "cors";
import AuthRouter from "./auth/auth";
import UserRouter from "./user/user";
import rampRouter from "./ramp/ramp";
import merchantRouter from "./merchant/merchant";

// console.log("ENV", process.env);
const app = express();
// app.use((req, _, next) => {
//   console.log(
//     req.hostname,
//     req.socket.remoteAddress,
//     req.ip,
//     req.headers["x-forwarded-for"]
//   );
//   next();
// });
app.use(
  "/api/v1",
  cors({
    credentials: true,
    origin: process.env.WEB_URL,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/ramp", rampRouter);
app.use("/api/v1/merchant", merchantRouter);

app.get("/", (_, res) => {
  res.send("Health check succeeded");
});

app
  .listen(3000, () => console.log("Server is running on port 3000"))
  .on("error", (err) => console.error(err));
