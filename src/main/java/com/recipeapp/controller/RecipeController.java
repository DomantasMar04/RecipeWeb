package com.recipeapp.controller;

import com.recipeapp.dto.RecipeRequest;
import com.recipeapp.model.Recipe;
import com.recipeapp.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

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

    @PutMapping("/{id}")
    public Recipe update(@PathVariable Long id, @RequestBody RecipeRequest req) {
        return recipeService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        recipeService.delete(id);
        return "Deleted";
    }
}