import "dotenv/config";
import { StringValue } from "ms";


export default {
    auth: {
        secretKey: (process.env.JWT_SECRET_KEY || "secret_0123456789") as StringValue,
        tokenExpritaion: (process.env.TOKEN_EXPIRATION || "15m") as StringValue,
    }
}