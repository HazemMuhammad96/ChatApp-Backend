import mongoose, { Model, Document, ObjectId } from "mongoose"

interface IChat extends Document {
    recipients: Array<any>
    messages: Array<{ from: ObjectId, text: any, sentAt: Date }>
    seen: Array<{recipient: string, lastSeen: boolean}>
}

const Schema = mongoose.Schema

const chatSchema = new Schema(
    {
        recipients: {
            type: [String],
            required: true
        },
        messages: {
            type: []
        },
        seen: {
            type: []
        }
    }, { timestamps: true }
)

const Chat: Model<IChat> = mongoose.model("Chat", chatSchema)

export default Chat
