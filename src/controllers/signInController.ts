import { Response, NextFunction } from "express";
import { createToken, maxAgeSec } from "../middlewares/tokenCreation"
import MyRequest from "../models/interfaces/myRequest";

export default function signIn(req: MyRequest, res: Response, next: NextFunction) {

    const userId = req.userId

    const accessToken = createToken(userId)
    res.status(200)
        .cookie("authToken", accessToken, { maxAge: maxAgeSec * 1000 })
        .send({ message: "Signed in successfully", username: req.username, accessToken });

}

