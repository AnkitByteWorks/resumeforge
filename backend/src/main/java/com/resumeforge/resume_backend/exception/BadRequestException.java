package com.resumeforge.resume_backend.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
