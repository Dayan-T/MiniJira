import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository";


const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body; // ← password CLAIR
    
    //Vérifie email existe PAS
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }
    
    //HASH password
    const password_hash = await bcrypt.hash(password, 12);
    
    //Crée via REPOSITORY
    const user = await userRepository.createUser(email, password_hash);
    
    res.status(201).json({ 
      message: "User created", 
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error("Error in /auth/register:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    //Vérifie email existe
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid username  or password" });
    }
    
    //Vérifie password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username  or password" });
    }
    
    // TODO: générer JWT
    res.status(200).json({ 
      message: "Login successful",
      user: { id: user.user_id, email: user.email },
      token: "TODO-jwt-token"
    });
  } catch (error) {
    console.error("Error in /auth/login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
