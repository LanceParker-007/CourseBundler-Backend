//Iski vajah se hamare Error class mein message aur statusCode dono agaye hain

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;
