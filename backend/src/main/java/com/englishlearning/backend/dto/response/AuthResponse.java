package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
public class AuthResponse {
    private String token;
    public AuthResponse() {}
    public AuthResponse(String token) {
        this.token = token;
    }
}
