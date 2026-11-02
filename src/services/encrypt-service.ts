import bcrypt from 'bcrypt';

export class EncryptService {
    static async encrypt(password: string, rounds: number) : Promise<string> {
        return await bcrypt.hash(password, rounds);
    }

    static async compare(password: string, hashedPassword: string) : Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}