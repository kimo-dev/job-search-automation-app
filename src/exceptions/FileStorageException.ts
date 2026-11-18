import { AppException } from "./AppExceptions";

export class FileStorageException extends AppException {
    constructor(message: string, errorCode: string = "FileStorageException", statusCode: number = 500
    ) {
        super(message, statusCode, errorCode);
    }
}