import config from "@/config";
import { InvalidTokenException, TokenExpiredException } from "@/exceptions/http/AuthenticationException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { ServiceException } from "@/exceptions/serviceException";
import { AuthRepository } from "@/repository/auth-repository";
import { LoginUserSchema, SafeUser, User, UserByEmail, UserPayload } from "@/types/auth";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export class AuthService {

    constructor(private secretKey = config.auth.secretKey, private tokenExpiration = config.auth.tokenExpritaion) { }
    static async registerUser(data: User): Promise<SafeUser> {
        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await AuthRepository.register({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            password: passwordHash
        });
        return user;
    }

    static async login(data: LoginUserSchema): Promise<UserByEmail> {
        const user = await AuthRepository.findUserByEmail(data.email);
        if (!user) {
            throw new NotFoundException(`User with email ${data.email} was not found.`)
        }
        const passwordMatch = bcrypt.compare(data.password, user.password);
        if (!passwordMatch) {
            throw new NotFoundException("Invalid password");
        }
        return user;
    }

    // generateToken(payload: UserPayload): string {
    //     return jwt.sign(payload, this.secretKey, {
    //         expiresIn: this.tokenExpiration
    //     });
    // }

    // verifiyToken(token: string): UserPayload {
    //     try {
    //         return jwt.verify(token, this.secretKey) as UserPayload
    //     } catch (error) {
    //         if (error instanceof jwt.TokenExpiredError) {
    //             throw new TokenExpiredException();
    //         }
    //         if (error instanceof jwt.JsonWebTokenError) {
    //             throw new InvalidTokenException();
    //         }
    //         throw new ServiceException("Token verification failed");
    //     }
    // }

    


}