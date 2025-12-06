package com.legalyze.backendd.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512); // Securely generated key
    private static final long EXPIRATION_TIME = 86400000; // 1 day in milliseconds

    // ✅ Generate JWT token
    public String generateToken(String email, String role) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(email) // instead of setSubject()
                .claim("role", role)
                .issuedAt(new Date(now)) // instead of setIssuedAt()
                .expiration(new Date(now + EXPIRATION_TIME)) // instead of setExpiration()
                .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
                .compact();
    }

    // ✅ Extract claims
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY) // instead of parserBuilder()
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ✅ Validate token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

