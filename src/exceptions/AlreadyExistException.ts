export class AlreadyExistsException extends Error {
  constructor() {
    super("This property already exists");
    this.name = "AlreadyExistsException";
  }
}