import { Response, NextFunction } from "express";
import { createToken, maxAgeSec } from "../middlewares/tokenCreation"
import Chat from "../models/chat";
import MyRequest from "../models/interfaces/myRequest";

export async function getMessages(req: MyRequest, res: Response, next: NextFunction) {

    try {

        console.log(req.body.recipients)
        const chat = await Chat.findOne({ recipients: [...req.body.recipients].sort() })
        if (chat && chat.messages)
            res.send(chat.messages)
    }

    catch (e) {
        console.log(e)
        next(e)
    }
}

export async function getChats(req: MyRequest, res: Response, next: NextFunction) {


    try {
        const chat = await Chat.find({ recipients: req.body.username }).select("recipients -_id").sort({ updatedAt: -1 })
        res.send(chat)
    }
    catch (e) {
        console.log(e)
        next(e)
    }
}
