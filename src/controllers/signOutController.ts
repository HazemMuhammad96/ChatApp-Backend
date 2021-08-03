import { Request, Response, NextFunction } from "express";

export default function signOut(req: Request, res: Response, next: NextFunction) {
    try {
        res.cookie("authToken", "", { maxAge: 0 });
        res.send({ message: "LoggedOut" })
        
    }
    catch (e) {
        console.log(e)
    }
}