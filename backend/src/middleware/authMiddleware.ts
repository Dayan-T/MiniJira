import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
    email: string;
}

export function requireAuth (req: Request, res: Response, next: NextFunction) {
    try{
        const authHeader = req.headers["authorization"];
        if (!authHeader|| !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Invalid Authorization" });

        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string) as JwtPayload;
        
        (req as any).user = { id: decoded.userId, email: decoded.email };
        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }

;}

