export class DeudWSTaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeudWSTaskError";
  }
}