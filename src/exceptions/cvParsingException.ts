import { AppException } from "./AppExceptions";

export class CVParsingException extends AppException {
    constructor(message: string, errorCode: string = "CVParsingException", statusCode: number = 422){
        super(message, statusCode, errorCode);
    }
}