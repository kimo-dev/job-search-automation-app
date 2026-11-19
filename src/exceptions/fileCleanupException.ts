import { AppException } from "./AppExceptions";

export class FileCleanupException extends AppException {
    constructor(private readonly originalError: unknown, private readonly cleanupError: unknown){
        super("CV processing failed and uploaded file cleanup also failed",500,"FILE_CLEANUP_FAILED");
    }
}