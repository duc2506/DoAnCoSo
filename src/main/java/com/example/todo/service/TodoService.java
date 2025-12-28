package com.example.todo.service;

import com.example.todo.dto.TodoDTO;
import com.example.todo.model.Category;
import com.example.todo.model.Todo;
import com.example.todo.model.User;
import com.example.todo.repository.CategoryRepository;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TodoService {

    private static final Logger logger = LoggerFactory.getLogger(TodoService.class);

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TodoService(TodoRepository todoRepository, UserRepository userRepository, CategoryRepository categoryRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<TodoDTO> getAllTodosByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return todoRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TodoDTO> getTodosByStatus(String username, boolean completed) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return todoRepository.findByUserAndCompletedOrderByCreatedAtDesc(user, completed).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TodoDTO getTodoById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to access this todo");
        }
        return convertToDTO(todo);
    }

    @Transactional
    public TodoDTO createTodo(TodoDTO todoDTO, String username) {
        logger.info("Creating todo for user: {}, data: {}", username, todoDTO);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Todo todo = new Todo();
        todo.setTitle(todoDTO.getTitle());
        todo.setDescription(todoDTO.getDescription());
        todo.setCompleted(todoDTO.isCompleted());
        todo.setDueDate(todoDTO.getDueDate());
        todo.setPriorityLevel(todoDTO.getPriorityLevel() != null ? todoDTO.getPriorityLevel() : Todo.PriorityLevel.MEDIUM);
        todo.setUser(user);

        if (todoDTO.getCategoryIds() != null && !todoDTO.getCategoryIds().isEmpty()) {
            Set<Category> categories = new HashSet<>();
            for (Long categoryId : todoDTO.getCategoryIds()) {
                Category category = categoryRepository.findByIdAndUser(categoryId, user)
                        .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user: " + categoryId));
                categories.add(category);
            }
            todo.setCategories(categories);
        }

        Todo savedTodo = todoRepository.save(todo);
        logger.info("Todo saved: {}", savedTodo);
        return convertToDTO(savedTodo);
    }

    @Transactional
    public TodoDTO updateTodo(Long id, TodoDTO todoDTO, String username) {
        logger.info("Updating todo ID: {} for user: {}, data: {}", id, username, todoDTO);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to update this todo");
        }

        todo.setTitle(todoDTO.getTitle());
        todo.setDescription(todoDTO.getDescription());
        todo.setCompleted(todoDTO.isCompleted());
        todo.setDueDate(todoDTO.getDueDate());
        todo.setPriorityLevel(todoDTO.getPriorityLevel() != null ? todoDTO.getPriorityLevel() : Todo.PriorityLevel.MEDIUM);

        if (todoDTO.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>();
            for (Long categoryId : todoDTO.getCategoryIds()) {
                Category category = categoryRepository.findByIdAndUser(categoryId, user)
                        .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user: " + categoryId));
                categories.add(category);
            }
            todo.setCategories(categories);
        }

        Todo updatedTodo = todoRepository.save(todo);
        logger.info("Todo updated: {}", updatedTodo);
        return convertToDTO(updatedTodo);
    }

    @Transactional
    public void deleteTodo(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this todo");
        }
        todoRepository.delete(todo);
    }

    @Transactional
    public TodoDTO toggleTodoCompleted(Long id, String username) {
        logger.info("Toggling todo completed status for ID: {} by user: {}", id, username);
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Todo todo = todoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Todo not found"));
            if (!todo.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You don't have permission to update this todo");
            }

            // Kiểm tra danh mục hiện tại của công việc
            if (todo.getCategories() != null && !todo.getCategories().isEmpty()) {
                logger.info("Todo has categories: {}", todo.getCategories());
                for (Category category : todo.getCategories()) {
                    Category existingCategory = categoryRepository.findByIdAndUser(category.getId(), user)
                            .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user: " + category.getId()));
                    logger.info("Validated category: {}", existingCategory.getId());
                }
            }

            // Chuyển đổi trạng thái completed
            todo.setCompleted(!todo.isCompleted());
            todo.setUpdatedAt(LocalDateTime.now());

            // Lưu công việc
            Todo updatedTodo = todoRepository.save(todo);
            logger.info("Todo updated successfully: {}", updatedTodo);
            return convertToDTO(updatedTodo);
        } catch (Exception e) {
            logger.error("Error toggling todo completed status for ID: {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to toggle todo completed status: " + e.getMessage());
        }
    }

    public List<TodoDTO> searchTodos(String keyword, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return todoRepository.searchByTitleOrDescription(user, keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TodoDTO> getTodosByCategory(Long categoryId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return todoRepository.findByUserAndCategory(user, categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TodoDTO> getTodosByPriority(Todo.PriorityLevel priorityLevel, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return todoRepository.findByUserAndPriorityLevelOrderByCreatedAtDesc(user, priorityLevel).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TodoDTO convertToDTO(Todo todo) {
        TodoDTO todoDTO = new TodoDTO();
        todoDTO.setId(todo.getId());
        todoDTO.setTitle(todo.getTitle());
        todoDTO.setDescription(todo.getDescription());
        todoDTO.setCreatedAt(todo.getCreatedAt());
        todoDTO.setUpdatedAt(todo.getUpdatedAt());
        todoDTO.setDueDate(todo.getDueDate());
        todoDTO.setCompleted(todo.isCompleted());
        todoDTO.setPriorityLevel(todo.getPriorityLevel());
        Set<Long> categoryIds = todo.getCategories().stream()
                .map(Category::getId)
                .collect(Collectors.toSet());
        todoDTO.setCategoryIds(categoryIds);
        return todoDTO;
    }
}