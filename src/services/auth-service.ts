import { NotFoundException } from "@/exceptions/notFoundException";
import { AuthRepository } from "@/repository/auth-repository";
import { LoginUserSchema, SafeUser, User, UserByEmail, UserPayload } from "@/types/auth";
import bcrypt from 'bcrypt';
import { EncryptService } from "./encrypt-service";
import { InvalidPasswordException } from "@/exceptions/http/AuthenticationException";

export class AuthService {

    static async registerUser(data: User): Promise<SafeUser> {
        const user = await AuthRepository.register(data);
        return user;
    }

    static async login(data: LoginUserSchema): Promise<SafeUser> {
        const user = await AuthRepository.findUserByEmail(data.email);
        if (!user) {
            throw new NotFoundException(`User with email ${data.email} was not found.`)
        }
        const passwordMatch = await EncryptService.compare(data.password, user.password);
        if (!passwordMatch) {
            throw new InvalidPasswordException("Invalid password");
        }
        if(!user.isVerified){
            throw new NotFoundException(`User with email ${data.email} is not verified, please verifiy your email.`)
        }
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        };
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