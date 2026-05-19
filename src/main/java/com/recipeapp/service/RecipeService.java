package com.recipeapp.service;

import com.recipeapp.dto.RecipeRequest;
import com.recipeapp.model.Recipe;
import com.recipeapp.model.User;
import com.recipeapp.repository.RecipeRepository;
import com.recipeapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;

    public Recipe create(RecipeRequest req) {
        User user = userRepository.findById(req.userId).orElse(null);

        if (user == null) {
            return null;
        }

        Recipe recipe = new Recipe(
                req.title,
                req.category,
                req.cookingTime,
                req.description,
                user
        );

        return recipeRepository.save(recipe);
    }

    public List<Recipe> getAll() {
        List<Recipe> recipes = recipeRepository.findAll();

        recipes.sort((r1, r2) -> Integer.compare(r2.getScore(), r1.getScore()));

        return recipes;
    }

    public Recipe getById(Long id) {
        return recipeRepository.findById(id).orElse(null);
    }

    public Recipe update(Long id, RecipeRequest req, Long userId) {
        Recipe recipe = recipeRepository.findById(id).orElse(null);

        if (recipe == null) {
            return null;
        }

        // Saugumo patikra gynimui: leidžiame redaguoti tik autoriui
        if (recipe.getAuthor() != null && !recipe.getAuthor().getId().equals(userId)) {
            return null;
        }

        recipe.setTitle(req.title);
        recipe.setCategory(req.category);
        recipe.setCookingTime(req.cookingTime);
        recipe.setDescription(req.description);

        return recipeRepository.save(recipe);
    }

    public void delete(Long id) {
        recipeRepository.deleteById(id);
    }

    public Recipe upvote(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId).orElse(null);

        if (recipe == null) {
            return null;
        }

        if (recipe.getAuthor() != null && recipe.getAuthor().getId().equals(userId)) {
            return null;
        }

        recipe.setUpvotes(recipe.getUpvotes() + 1);

        return recipeRepository.save(recipe);
    }

    public Recipe downvote(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId).orElse(null);

        if (recipe == null) {
            return null;
        }

        if (recipe.getAuthor() != null && recipe.getAuthor().getId().equals(userId)) {
            return null;
        }

        recipe.setDownvotes(recipe.getDownvotes() + 1);

        return recipeRepository.save(recipe);
    }
}