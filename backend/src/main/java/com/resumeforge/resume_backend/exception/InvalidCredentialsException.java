package com.resumeforge.resume_backend.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() { super("Invalid email or password."); }
    public InvalidCredentialsException(String message) { super(message); }
}
