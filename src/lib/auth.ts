import config from "@/config";
import { InvalidTokenException, TokenExpiredException } from "@/exceptions/http/AuthenticationException";
import { ServiceException } from "@/exceptions/serviceException";
import { UserPayload } from "@/types/auth";
import jwt from "jsonwebtoken";


export function generateToken(payload: UserPayload) {
    return jwt.sign(payload, config.auth.secretKey, {
        expiresIn: config.auth.tokenExpritaion
    });
}

export function verifiyToken(token: string): UserPayload {
    try {
        return jwt.verify(token, config.auth.secretKey) as UserPayload
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new TokenExpiredException();
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new InvalidTokenException();
        }
        throw new ServiceException("Token verification failed");
    }
}