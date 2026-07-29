package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.LoginRequest;
import com.englishlearning.backend.dto.response.AuthResponse;

public interface AuthService{
    public AuthResponse login(LoginRequest request);
}
