class AppError {
  public readonly message: string;

  public readonly status: string;

  constructor(message: string, status = 'error') {
    this.message = message;
    this.status = status;
  }
}

export default AppError;
