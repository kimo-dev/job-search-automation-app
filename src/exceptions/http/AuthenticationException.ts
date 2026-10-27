import { httpException } from "./httpException";

export class AuthenticationException extends httpException {
    constructor(message: string){
        super(401,message);
        this.name = "AuthenticationException";
    }
}

export class InvalidPasswordException extends httpException {
    constructor(message: string){
        super(401,message);
        this.name = "InvalidPasswordException";
    }
}

export class TokenExpiredException extends AuthenticationException {
    constructor(){
        super("Token expired");
        this.name = "TokenExpiredException";
    }
}

export class InvalidTokenException extends AuthenticationException {
    constructor(){
        super("Invalid Token");
        this.name = "InvalidTokenException";
    }
}