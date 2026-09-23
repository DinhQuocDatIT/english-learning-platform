package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.LoginRequest;
import com.englishlearning.backend.dto.response.AuthResponse;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.UnauthorizedException;
import com.englishlearning.backend.mapper.UserMapper;
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

    @Autowired
    private UserMapper userMapper;

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));
        if (user.getDeletedAt() != null) {
            throw new UnauthorizedException("Tài khoản đã bị khóa");
        }



        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
          throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
      }
      String token = jwtUtil.generateToken(user);

        return new AuthResponse(token,userMapper.toResponse(user));
    }
}
