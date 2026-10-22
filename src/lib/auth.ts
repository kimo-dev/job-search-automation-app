import config from "@/config";
import { InvalidTokenException, TokenExpiredException } from "@/exceptions/http/AuthenticationException";
import { ServiceException } from "@/exceptions/serviceException";
import { UserPayload } from "@/types/auth";
import jwt from "jsonwebtoken";
import ms from "ms";
import { cookies } from 'next/headers';

export function generateToken(payload: UserPayload) : string {
    return jwt.sign(payload, config.auth.secretKey, {
        expiresIn: config.auth.tokenExpiration
    });
}

export function generateRefreshToken(payload: UserPayload): string {
    return jwt.sign(
        payload,
        config.auth.secretKey,
        { expiresIn: config.auth.refreshTokenExpiration }
    );
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
export function verifyRefreshToken(refreshToken: string) : string {
    const payload = verifiyToken(refreshToken);
    if (!payload) {
        throw new InvalidTokenException();
    }
    return generateToken(payload);
}
export async function setTokenIntoCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set("access_token", token,
        {
            httpOnly: true,
            secure: config.isProduction,
            maxAge: ms(config.auth.tokenExpiration) / 1000,
            path: '/'
        }
    );
}

export async function setRefreshTokenIntoCookie(refreshToken: string) {
    const cookieStore = await cookies();
    cookieStore.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        maxAge: ms(config.auth.refreshTokenExpiration) / 1000,
        path: '/'
    });
}
export async function clearTokens() {
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
}

export async function persistAuthentication(payload: UserPayload) {
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await setTokenIntoCookie(token);
    await setRefreshTokenIntoCookie(refreshToken);
}