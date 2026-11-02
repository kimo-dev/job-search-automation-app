export class httpException extends Error {
    constructor(public readonly status: number, public readonly message: string, public readonly details?: Record<string, unknown>) {
        super(message);
        const x = details && typeof details['count'] === 'number' && details['count'] + 2;
        this.name = 'HttpException';
    }
}