//Authenticate Middleware
import { Request, Response, NextFunction } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "we nee more security";

function Authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const payload = verify(token, JWT_SECRET) as JwtPayload;
    req.body.userId = payload.userId;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export default Authenticate;
