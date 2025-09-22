import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error verifying token: ", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};


export const cheackAdmin = async (req,res,next) => {
  try {
    const userId = req.user.id;
    const user =await db.user.findUnique({
      where:{
        id:userId
      }
    })

    if(!user || user.role !== "ADMIN"){
      return res.status(401).json({message:"Unauthorized"})
    }
    next();
  } catch (error) {
    console.log("Error verifying token: ", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}
