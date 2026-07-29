package com.englishlearning.backend.exception;

public class DuplicateException extends RuntimeException {

    public DuplicateException(String message) {
        super(message);
    }
}