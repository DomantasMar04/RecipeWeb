package com.recipeapp.repository;

import com.recipeapp.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Favorite findByUserIdAndRecipeId(Long userId, Long recipeId);

    List<Favorite> findByUserId(Long userId);
}