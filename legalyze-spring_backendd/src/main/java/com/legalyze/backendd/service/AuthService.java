package com.legalyze.backendd.service;
import com.legalyze.backendd.config.SecurityConfig;
import com.legalyze.backendd.dto.LoginRequest;
import com.legalyze.backendd.dto.SignupRequest;
import com.legalyze.backendd.dto.LoginResponse;
import com.legalyze.backendd.model.User;
import com.legalyze.backendd.repository.UserRepository;
import com.legalyze.backendd.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    public String register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return "User already exists!";
        }
        User user = new User(null, request.getName(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()), request.getRole());
        userRepository.save(user);
        return "User registered successfully!";
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getRole(), user.getName());
    }
}
