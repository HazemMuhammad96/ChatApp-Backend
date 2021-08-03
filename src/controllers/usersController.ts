import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs"
import User from "../models/user"
import { maxAgeSec, createToken } from "../middlewares/tokenCreation"

async function postUser(req: Request, res: Response, next: NextFunction) {

    const newUser = new User(req.body);

    try {
        const savedUser = await newUser.save()
        const token = createToken(savedUser._id);

        res.status(201)
            .cookie("authToken", token, { maxAge: maxAgeSec * 1000 })
            .send({ message: "signed up successfully", username: savedUser.username });

    }
    catch (e) {
        next(e)
    }

}


export default { postUser };