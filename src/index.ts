require("dotenv").config({ path: ".env" })
import express from "express"
import http from "http"
import mongoose from "mongoose"
import RequestError from "./models/interfaces/error"
import { RequestMessages } from "./models/requestMessages"
import usersRouter from "./routes/usersRouter"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import signInValidation from "./middlewares/validation/signInValidation"
import signIn from "./controllers/signInController"
import signOut from "./controllers/signOutController"
import { validateToken } from "./middlewares/validation/tokenvalidation"
import cors from "cors"
import { getChats, getMessages } from "./controllers/messagesController"
import initSocketIO from "./server/webSockets"




//Constants
const port = process.env.PORT
const mongoURI = process.env.MONGOURI

//Connections
const app = express();
const server = http.createServer(app)
initSocketIO(server)

mongoose.connect(mongoURI || "",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },
  () => console.log(`Database is connected on address ${mongoURI}`)
)

server.listen(port, () => console.log(`Server is running on port ${port} secret is ${process.env.ACCESS_TOKEN_SECRET}`));


//Middlewares
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true
  })
)
app.use(cookieParser())


//Routing
app.get("/test", (req, res) => { res.send("Hi There!") })
app.use("/users", usersRouter)
app.post("/signIn", signInValidation, signIn)
app.post("/signOut", signOut)

//Check for cookies
app.use(validateToken)
app.post("/chats", getChats)
app.post("/messages", getMessages)



//Error Handling 
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = new RequestError(RequestMessages.NotFound)
  next(error)
})


app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(error)
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message,
      status: error.status
    },
    hint: "Navigate to /help endpoint for documentation."
  })
})

