package com.englishlearning.backend.exception;


import com.englishlearning.backend.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;


@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex
    ){

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new ErrorResponse(
                                404,
                                ex.getMessage(),
                                LocalDateTime.now()
                        )
                );
    }


    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(
            DuplicateException ex
    ){

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new ErrorResponse(
                                400,
                                ex.getMessage(),
                                LocalDateTime.now()
                        )
                );
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception ex
    ){

        return ResponseEntity
                .status(500)
                .body(
                        new ErrorResponse(
                                500,
                                "Internal server error",
                                LocalDateTime.now()
                        )
                );
    }
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex
    ){

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        new ErrorResponse(
                                401,
                                ex.getMessage(),
                                LocalDateTime.now()
                        )
                );
    }
    @ExceptionHandler({
            NoResourceFoundException.class,
            NoHandlerFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFoundUrl(
            Exception ex
    ){

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new ErrorResponse(
                                404,
                                "Endpoint not found",
                                LocalDateTime.now()
                        )
                );
    }
}