import { AppException } from "./AppExceptions";

export class CVAlreadyUploadedException extends AppException {
    constructor(message: string, errorCode: string = "CVAlreadyUploadedException"){
        super(message, 409, errorCode);
    }
}