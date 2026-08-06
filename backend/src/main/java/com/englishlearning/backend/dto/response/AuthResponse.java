package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
public class AuthResponse {
    private String token;
    private UserResponse user;
    public AuthResponse() {}
    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }
}
