import "dotenv/config";
import { StringValue } from "ms";


export default {
    isProduction: process.env.NODE_ENV === "production",
    auth: {
        secretKey: (process.env.JWT_SECRET_KEY || "secret_0123456789") as StringValue,
        tokenExpiration: (process.env.TOKEN_EXPIRATION || "15m") as StringValue, 
        refreshTokenExpiration: (process.env.REFRESH_TOKEN_EXPIRATION || "15m") as StringValue, 
    }
}