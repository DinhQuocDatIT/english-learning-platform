package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private int status;

    private String message;

    private T data;
}