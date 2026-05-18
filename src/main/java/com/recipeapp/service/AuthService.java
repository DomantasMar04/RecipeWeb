package com.recipeapp.service;

import com.recipeapp.dto.LoginRequest;
import com.recipeapp.dto.RegisterRequest;
import com.recipeapp.dto.UserResponse;
import com.recipeapp.model.User;
import com.recipeapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.recipeapp.dto.AuthResponse;
import com.recipeapp.security.JWTService;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email)) {
            return null;
        }

        User user = new User(
                request.username,
                request.email,
                request.password
        );

        User savedUser = userRepository.save(user);

        String token = jwtService.createToken(savedUser);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                token
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email).orElse(null);

        if (user == null) {
            return null;
        }

        if (!user.getPassword().equals(request.password)) {
            return null;
        }

        String token = jwtService.createToken(user);

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                token
        );
    }

}