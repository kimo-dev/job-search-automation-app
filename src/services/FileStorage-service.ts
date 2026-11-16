import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export class FileStorageService {
    private static readonly Storage_Root = path.join(process.cwd(), "storage");

    static async SaveToStorage(userId: string, folderName: string, type: string, file: File) {
        const name = file.name;
        const extension = path.extname(name).slice(1).toLocaleLowerCase();
        if(!extension){
            throw new Error("File extension is missing");
        }

        const key = `${randomUUID}.${extension}`;

        const fileKey = path.posix.join(
            folderName,
            type,
            userId,
            key
        );
        console.log("filekey", fileKey);

        
        const filePath = this.ResolveStoragePath(fileKey);
        console.log("path.dirname(filePath)", path.dirname(filePath));
        await fs.mkdir(path.dirname(filePath), { recursive: true});

        const bytes = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(filePath, bytes);

        return {
            fileKey,
            fileName: name,
            fileSize: file.size,
            fileTtype: file.type
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
                throw new Error("File not found");
            }

            throw error;
        }
    }


    private static ResolveStoragePath(fileKey: string): string {
        const filePath = path.resolve(this.Storage_Root, fileKey);

        if (!filePath.startsWith(this.Storage_Root + path.sep)) {
            throw new Error("Invalid storage path");
        }

        return filePath;
    }
}