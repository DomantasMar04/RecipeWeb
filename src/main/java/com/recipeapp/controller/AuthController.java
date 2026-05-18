package com.recipeapp.controller;

import com.recipeapp.dto.RegisterRequest;
import com.recipeapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public String signup(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}