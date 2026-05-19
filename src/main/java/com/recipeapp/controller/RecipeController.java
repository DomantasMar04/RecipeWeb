package com.recipeapp.controller;

import com.recipeapp.dto.FavoriteRequest;
import com.recipeapp.dto.RecipeRequest;
import com.recipeapp.dto.VoteRequest;
import com.recipeapp.model.Favorite;
import com.recipeapp.model.Recipe;
import com.recipeapp.model.User;
import com.recipeapp.repository.FavoriteRepository;
import com.recipeapp.repository.UserRepository;
import com.recipeapp.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Recipe create(@RequestBody RecipeRequest req) {
        return recipeService.create(req);
    }

    @GetMapping
    public List<Recipe> getAll() {
        return recipeService.getAll();
    }

    @GetMapping("/{id}")
    public Recipe getById(@PathVariable Long id) {
        return recipeService.getById(id);
    }

    // TEISINGAS UPDATE METODAS VALDIKLYJE:
    @PutMapping("/{id}")
    public Recipe update(@PathVariable Long id, @RequestBody RecipeRequest req) {
        // Valdiklis tik priima HTTP užklausą ir viską deleguoja servisui
        return recipeService.update(id, req, req.userId);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        recipeService.delete(id);
        return "Deleted";
    }

    @PostMapping("/{id}/upvote")
    public Recipe upvote(@PathVariable Long id, @RequestBody VoteRequest req) {
        return recipeService.upvote(id, req.userId);
    }

    @PostMapping("/{id}/downvote")
    public Recipe downvote(@PathVariable Long id, @RequestBody VoteRequest req) {
        return recipeService.downvote(id, req.userId);
    }

    @PostMapping("/{id}/favorite")
    public String favorite(@PathVariable Long id, @RequestBody FavoriteRequest req) {
        Favorite existingFavorite = favoriteRepository.findByUserIdAndRecipeId(req.userId, id);

        if (existingFavorite != null) {
            return "Already favorited";
        }

        User user = userRepository.findById(req.userId).orElse(null);
        Recipe recipe = recipeService.getById(id);

        if (user == null || recipe == null) {
            return "User or recipe not found";
        }

        Favorite favorite = new Favorite(user, recipe);
        favoriteRepository.save(favorite);

        return "Recipe added to favorites";
    }

    @DeleteMapping("/{id}/favorite/{userId}")
    public String unfavorite(@PathVariable Long id, @PathVariable Long userId) {
        Favorite favorite = favoriteRepository.findByUserIdAndRecipeId(userId, id);

        if (favorite == null) {
            return "Favorite not found";
        }

        favoriteRepository.delete(favorite);

        return "Recipe removed from favorites";
    }
}