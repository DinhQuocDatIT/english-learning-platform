package com.englishlearning.backend.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

//    public BusinessException(String message) {
//        super(message);
//    }
private final ErrorCode errorCode;
    private final String message;

    // Dùng ErrorCode
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.message = errorCode.getMessage();
    }

    // Dùng ErrorCode + custom message
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }

    // Dùng String message (giữ lại cho tương thích ngược)
    public BusinessException(String message) {
        super(message);
        this.errorCode = null;
        this.message = message;
    }

    @Override
    public String getMessage() {
        return message;
    }
}