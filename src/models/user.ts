import mongoose, { Model, Document, ObjectId } from "mongoose"
import { NextFunction } from "express"
import RequestError from "./interfaces/error"
import { RequestMessages } from "./requestMessages"
import bcrypt from "bcryptjs"


interface IUser extends Document {
    name: string
    username: string
    password: string
}

const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 20,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            minlength: 5,
            maxlength: 30,
            trim: true,
            validate: async function (value: string) {
                if (value.includes(" "))
                    throw new RequestError(RequestMessages.NotValidUsername)

                try {
                    const foundUsername = await User.findOne({ username: value })
                    if (foundUsername)
                        throw new RequestError(RequestMessages.UsernameExists)
                }
                catch (e) {
                    throw new Error(e)
                }
            },
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            trim: true,
        },
    }, { timestamps: true }
)

userSchema.index({ name: "text", username: "text" })

userSchema.pre<IUser>("save", async function (next: NextFunction) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

const User: Model<IUser> = mongoose.model("User", userSchema)

export default User