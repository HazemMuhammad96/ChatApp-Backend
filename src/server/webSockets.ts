import { Server, Socket } from "socket.io"
import User from "../models/user"
import Chat from "../models/chat"
import cookieParser from "socket.io-cookie-parser"


function roomCreation(id, socket) {

    socket.on("createRoom", (recipients) => {

        if (recipients.length != 0) {
            socket.emit("RecieveRoom", recipients.sort())

            console.log(recipients.sort())
            recipients.forEach((rec) => {
                const send = recipients.filter((val) => val != rec)
                send.push(id)

                socket.broadcast.to(rec).emit("RecieveRoom", send.sort())
            })
        }
    })

}

function manageMessaging(id, socket) {

    socket.on(`sendMessage`, async ({ to, message }) => {

        try {
            const recipientsArr = [...to, id].sort()
            const searchChat = await Chat.findOne({ recipients: recipientsArr })

            if (!searchChat) {

                const seen = []
                recipientsArr.forEach(rec => {
                    seen.push({ recipient: rec, lastSeen: true })
                })

                const newChat = new Chat({
                    recipients: [...to, id].sort(),
                    seen
                })
                const savedChat = await newChat.save()

            }

            if (message.length != 0) {
                const messageObject = { from: id, text: message, sentAt: new Date().getTime() }

                await Chat.updateOne({ recipients: [...to, id].sort() },
                    { $push: { messages: messageObject } })

                to.forEach(async (currentRec) => {
                    await Chat.updateOne({ recipients: [...to, id].sort(), "seen.recipient": currentRec },
                        { $set: { "seen.$.lastSeen": false } })
                });

                socket.emit(`RecieveMessage-${to.sort()}`, messageObject)
                socket.emit(`RecieveNotification`, { chatId: to.sort(), last: messageObject, seen: true })

                to.forEach((rec) => {
                    const send = to.filter((val) => val != rec)
                    send.push(id)



                    console.log(`sent from ${id} to ${send.sort()}`)
                    socket.broadcast.to(rec).emit(`RecieveMessage-${send.sort()}`, messageObject)
                    socket.broadcast.to(rec).emit(`RecieveNotification`, { chatId: send.sort(), last: messageObject, seen: false })

                })

            }

        }
        catch (e) {
            console.log(e)
        }

    })

}

function manageIsTyping(id, socket) {
    socket.on("typing", ({ to, indicator }) => {



        to.forEach((rec) => {
            const send = to.filter((val) => val != rec)
            send.push(id)

            socket.broadcast.to(rec).emit(`typing-${send.sort()}`, { id, indicator })

        })
    })
}

export default function initSocketIO(server) {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
        },
        cookie: true,

    })

    io.use(cookieParser());


    io.of("/websockets").on("connection", (socket) => {
        const id = socket.handshake.query.id
        socket.join(id)
        console.log(`${id} Joined`)






        roomCreation(id, socket)
        manageMessaging(id, socket)
        manageIsTyping(id, socket)

        socket.on("seenIndecator", async ({ to, lastSeen }) => {
            await Chat.updateOne({ recipients: [...to, id].sort(), "seen.recipient": id },
                { $set: { "seen.$.lastSeen": true } })
        })
    })

}