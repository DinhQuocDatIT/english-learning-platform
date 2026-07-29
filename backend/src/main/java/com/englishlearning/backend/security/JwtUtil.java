package com.englishlearning.backend.security;

import com.englishlearning.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
       // return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // tạo token
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().getName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    // lấy tất cả
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    // lấy email
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }
    // lấy ID
    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }
    // lấy role
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
    // check token hợp lệ
    public boolean isValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
