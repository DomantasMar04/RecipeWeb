package com.recipeapp.controller;

import com.recipeapp.dto.AuthResponse;
import com.recipeapp.dto.LoginRequest;
import com.recipeapp.dto.RegisterRequest;
import com.recipeapp.dto.UserResponse;
import com.recipeapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public Object signup(@RequestBody RegisterRequest request) {
        AuthResponse user = authService.register(request);

        if (user == null) {
            return "Email already exists";
        }

        return user;
    }

    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest request) {
        AuthResponse user = authService.login(request);

        if (user == null) {
            return "Invalid email or password";
        }

        return user;
    }
}