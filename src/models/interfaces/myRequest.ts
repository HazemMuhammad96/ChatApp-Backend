import { ObjectId } from "mongoose";
import { Request } from "express";

export default interface MyRequest extends Request {
    userId: ObjectId
    username: string
    cookies: any
}