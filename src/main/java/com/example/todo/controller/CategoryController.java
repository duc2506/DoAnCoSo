package com.example.todo.controller;

import com.example.todo.dto.CategoryDTO;
import com.example.todo.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories(Authentication authentication) {
        return ResponseEntity.ok(categoryService.getAllCategoriesByUser(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(categoryService.getCategoryById(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO, 
                                                    Authentication authentication) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDTO, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, 
                                                    @Valid @RequestBody CategoryDTO categoryDTO, 
                                                    Authentication authentication) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, Authentication authentication) {
        categoryService.deleteCategory(id, authentication.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted successfully");
        
        return ResponseEntity.ok(response);
    }
}