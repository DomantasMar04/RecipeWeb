package com.recipeapp.controller;


import com.recipeapp.dto.UserResponse;
import com.recipeapp.model.Favorite;
import com.recipeapp.model.Recipe;
import com.recipeapp.model.User;
import com.recipeapp.repository.FavoriteRepository;
import com.recipeapp.repository.UserRepository;
import com.recipeapp.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return null;
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }

    @GetMapping("/{id}/recipes")
    public List<Recipe> getUserRecipes(@PathVariable Long id) {
        return recipeRepository.findByAuthorId(id);
    }

    @GetMapping("/{id}/favorites")
    public List<Recipe> getUserFavorites(@PathVariable Long id) {
        List<Favorite> favorites = favoriteRepository.findByUserId(id);

        List<Recipe> recipes = new ArrayList<>();

        for (Favorite favorite : favorites) {
            recipes.add(favorite.getRecipe());
        }

        return recipes;
    }
}
