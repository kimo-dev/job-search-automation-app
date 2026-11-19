import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { ReturnedSaveToStorageType } from "@/types/file";
import { FileStorageException } from "@/exceptions/FileStorageException";

export class FileStorageService {
    private static readonly Storage_Root = path.join(process.cwd(), "storage");

    static async SaveToStorage(userId: string, folderName: string, type: string, file: File) : Promise<ReturnedSaveToStorageType> {
        const name = file.name.toLowerCase();
        const extension = path.extname(name).slice(1).toLocaleLowerCase();
        if(!extension){
            throw new FileStorageException("File extension is missing", "File_Extension_Missing", 400);
        }

        const key = `${randomUUID()}.${extension}`;

        const fileKey = path.posix.join(
            folderName,
            type,
            userId,
            key
        );

        
        const filePath = this.ResolveStoragePath(fileKey);
        await fs.mkdir(path.dirname(filePath), { recursive: true});

        const bytes = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(filePath, bytes);

        return {
            fileKey,
            fileName: name,
            fileSize: file.size,
            fileType: file.type,
            buffer: bytes
        }
    }

    static async DeleteFromStorage(filekey: string) {
        const filePath = this.ResolveStoragePath(filekey);
        try {
            await fs.unlink(filePath);

            const parentFolder = path.dirname(filePath);

            await fs.rmdir(parentFolder);
        }catch(error){
            if (
                error instanceof Error &&
                "code" in error &&
                error.code === "ENOENT"
            ) {
                throw new FileStorageException("File not found to delete", "File_Not_Found_To_Delete", 404);
            }
            throw error;
        }
    }


    static async GetFromStorage(fileKey: string): Promise<Buffer> {
        const filePath = this.ResolveStoragePath(fileKey);

        try {
            return await fs.readFile(filePath);
        } catch (error) {
            if (
                error instanceof Error &&
                "code" in error &&
                error.code === "ENOENT"
            ) {
                throw new FileStorageException("File not found","File_Not_Found", 404);
            }

            throw error;
        }
    }


    private static ResolveStoragePath(fileKey: string): string {
        const filePath = path.resolve(this.Storage_Root, fileKey);

        if (!filePath.startsWith(this.Storage_Root + path.sep)) {
            throw new FileStorageException("Invalid storage path", "Invalid_Storage_Path", 400);
        }

        return filePath;
    }
}