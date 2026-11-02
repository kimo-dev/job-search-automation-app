import config from "@/config";
import { AuthenticationFailedException, InvalidTokenException, TokenExpiredException } from "@/exceptions/http/AuthenticationException";
import { ServiceException } from "@/exceptions/serviceException";
import { UserPayload } from "@/types/auth";
import jwt from "jsonwebtoken";
import ms from "ms";
import { cookies } from 'next/headers';
import { NextRequest } from "next/server";

export interface AuthRequest extends Request {
    user: UserPayload;
}

export function generateToken(payload: UserPayload): string {
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
export function refreshToken(refreshToken: string) {
    const payload = verifiyToken(refreshToken);
    if (!payload) {
        throw new InvalidTokenException();
    }
    const { iat, exp, ...userPayload } = payload;
    return generateToken(userPayload);
}
export function verifyRefreshToken(refreshToken: string): string {
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

export async function getAuthenticatedUser(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value;
    const token_refresh = cookieStore.get("refresh_token")?.value;
    if (!token) {
        if (!token_refresh) {
            throw new AuthenticationFailedException();
        }
        const newToken = refreshToken(token_refresh!);
        setTokenIntoCookie(newToken);
        token = newToken;
    }

    try {
        const  payload  = verifiyToken(token);
        if (
            typeof payload.userId !== "string" ||
            typeof payload.email !== "string" ||
            typeof payload.role !== "string"
        ) {
            return null;
        }
        return {
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        }
    } catch (error) {
        return null;
    }

}