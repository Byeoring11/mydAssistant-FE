export class ErrorBase extends Error {
    constructor(
      public message: string,
      public statusCode: number = 500,
      public errorId?: string
    ) {
      super(message);
      Object.setPrototypeOf(this, ErrorBase.prototype);
    }
}