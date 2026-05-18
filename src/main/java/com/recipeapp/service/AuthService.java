package com.recipeapp.service;

import com.recipeapp.dto.RegisterRequest;
import com.recipeapp.model.User;
import com.recipeapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email)) {
            return "Email already exists";
        }

        User user = new User(
                request.username,
                request.email,
                request.password
        );

        userRepository.save(user);

        return "User registered successfully";
    }

}