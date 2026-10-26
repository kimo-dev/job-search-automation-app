export class DbException extends Error {
    constructor(message: string){
        super(message);
        this.name ="DbException"; 
    }
}