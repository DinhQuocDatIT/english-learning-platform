package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.LoginRequest;
import com.englishlearning.backend.dto.response.AuthResponse;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.UnauthorizedException;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.security.JwtUtil;
import com.englishlearning.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new UnauthorizedException("Email or password incorrect"));
      if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
          throw new UnauthorizedException("Email or password incorrect");
      }
      String token = jwtUtil.generateToken(user);

        return new AuthResponse(token);
    }
}
