import { randomUUID } from "node:crypto";
import fs from "fs/promises";
import path from "node:path";

export class StorageUtils { 
    static async SaveToStorage(userId: string, folderName: string, type: string, file: File) {
        const name = file.name;
        const extension = path.extname(name).slice(1).toLocaleLowerCase();
        // validate thtat the file has an etension

        const storageRoot = path.resolve(process.cwd(), folderName);

        const uploadDir = path.join(storageRoot, type, userId);

        if(!uploadDir.startsWith(storageRoot + path.sep)){
            throw new Error("Invalid storage path");
        }

        const key = `${randomUUID()}.${extension}`;

        const filePath = path.join(uploadDir, key);

        await fs.mkdir(uploadDir, { recursive: true });

        const bytes = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, bytes);

        return {
        fileKey: path.posix.join(folderName, type, userId, key),
        fileName: file.name,
        fileSize: file.size
        };
    }
}