package com.example.todo.service;

import com.example.todo.dto.CategoryDTO;
import com.example.todo.model.Category;
import com.example.todo.model.User;
import com.example.todo.repository.CategoryRepository;
import com.example.todo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryDTO> getAllCategoriesByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return categoryRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return convertToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (categoryRepository.existsByNameAndUser(categoryDTO.getName(), user)) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setColor(categoryDTO.getColor());
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if name is changed and not already in use
        if (!category.getName().equals(categoryDTO.getName()) && 
            categoryRepository.existsByNameAndUser(categoryDTO.getName(), user)) {
            throw new RuntimeException("Category with this name already exists");
        }

        category.setName(categoryDTO.getName());
        category.setColor(categoryDTO.getColor());

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        categoryRepository.delete(category);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(category.getId());
        categoryDTO.setName(category.getName());
        categoryDTO.setColor(category.getColor());
        return categoryDTO;
    }
}