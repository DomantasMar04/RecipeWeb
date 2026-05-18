package com.recipeapp.dto;

public class AuthResponse {
    public Long id;
    public String username;
    public String email;
    public String token;

    public AuthResponse(Long id, String username, String email, String token) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.token = token;
    }
}
