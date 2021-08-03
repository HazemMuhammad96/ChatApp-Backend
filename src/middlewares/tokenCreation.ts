require("dotenv").config({ path: "../.env" });
import jwt from "jsonwebtoken";

export const maxAgeSec = 10 * 60 * 60;

export function createToken(id: any) {

    const payload = {
        id: id
    }
    
    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: maxAgeSec
        }
    );
}