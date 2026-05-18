package com.recipeapp.service;

import com.recipeapp.dto.RecipeRequest;
import com.recipeapp.model.Recipe;
import com.recipeapp.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    public Recipe create(RecipeRequest req) {
        Recipe recipe = new Recipe(
                req.title,
                req.description,
                req.category,
                req.cookingTime
        );

        return recipeRepository.save(recipe);
    }

    public List<Recipe> getAll() {
        return recipeRepository.findAll();
    }

    public Recipe getById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
    }

    public Recipe update(Long id, RecipeRequest req) {
        Recipe recipe = getById(id);

        recipe.setTitle(req.title);
        recipe.setDescription(req.description);
        recipe.setCategory(req.category);
        recipe.setCookingTime(req.cookingTime);

        return recipeRepository.save(recipe);
    }

    public void delete(Long id) {
        recipeRepository.deleteById(id);
    }
}