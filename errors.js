// Errors the HTTP layer knows how to turn into responses, independent of the database
class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
    }
}

class ValidationError extends AppError {
    constructor(message) { super(message, 400); }
}

class ConflictError extends AppError {
    constructor(message) { super(message, 409); }
}

module.exports = { AppError, ValidationError, ConflictError };
