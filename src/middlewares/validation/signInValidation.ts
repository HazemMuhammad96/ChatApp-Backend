import { Request, Response, NextFunction } from "express"
import User from "../../models/user"
import joi from "joi"
import RequestError from "../../models/interfaces/error"
import { RequestMessages } from "../../models/requestMessages"
import bcrypt from "bcryptjs"
import MyRequest from "../../models/interfaces/myRequest"

function noWhiteSpaces(value: string, helpers: any) {

    if (value.includes(" ")) {
        return helpers.error("Invalid entry.");
    }

    return value;
};

function signInSchema(data: any) {
    const schema = joi.object({
        username: joi.string().min(5).max(30).required().trim().default(noWhiteSpaces),
        password: joi.string().min(8).max(30).required().trim().default(noWhiteSpaces)
    });

    return schema.validate(data).error;
}

export default async function signInValidation(req: MyRequest, res: Response, next: NextFunction) {

    try {
        const schemaError = signInSchema(req.body);
        if (schemaError) {
            next(schemaError)
            return
        }

        const user = await User.findOne({ username: req.body.username })

        if (!user) {

            const WrongUsernameError = new RequestError(RequestMessages.WrongUsername)
            next(WrongUsernameError)
            return
        }


        const passwordCompare = await bcrypt.compare(req.body.password, user.password)
        if (!passwordCompare) {
            const wrongPasswordError = new RequestError(RequestMessages.WrongPassword)
            next(wrongPasswordError)
            return
        }

        req.userId = user._id
        req.username = user.username
        next()

    } catch (err) {
        next(err)
    }
}
