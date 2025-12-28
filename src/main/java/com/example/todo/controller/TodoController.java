package com.example.todo.controller;

import com.example.todo.dto.TodoDTO;
import com.example.todo.model.Todo;
import com.example.todo.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public ResponseEntity<List<TodoDTO>> getAllTodos(Authentication authentication) {
        return ResponseEntity.ok(todoService.getAllTodosByUser(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoDTO> getTodoById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(todoService.getTodoById(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<TodoDTO> createTodo(@Valid @RequestBody TodoDTO todoDTO, Authentication authentication) {
        return ResponseEntity.ok(todoService.createTodo(todoDTO, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoDTO> updateTodo(@PathVariable Long id, 
                                             @Valid @RequestBody TodoDTO todoDTO, 
                                             Authentication authentication) {
        return ResponseEntity.ok(todoService.updateTodo(id, todoDTO, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long id, Authentication authentication) {
        todoService.deleteTodo(id, authentication.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Todo deleted successfully");
        
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoDTO> toggleTodoCompleted(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(todoService.toggleTodoCompleted(id, authentication.getName()));
    }

    @GetMapping("/completed")
    public ResponseEntity<List<TodoDTO>> getCompletedTodos(Authentication authentication) {
        return ResponseEntity.ok(todoService.getTodosByStatus(authentication.getName(), true));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TodoDTO>> getPendingTodos(Authentication authentication) {
        return ResponseEntity.ok(todoService.getTodosByStatus(authentication.getName(), false));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TodoDTO>> searchTodos(@RequestParam String keyword, Authentication authentication) {
        return ResponseEntity.ok(todoService.searchTodos(keyword, authentication.getName()));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TodoDTO>> getTodosByCategory(@PathVariable Long categoryId, Authentication authentication) {
        return ResponseEntity.ok(todoService.getTodosByCategory(categoryId, authentication.getName()));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TodoDTO>> getTodosByPriority(@PathVariable String priority, Authentication authentication) {
        Todo.PriorityLevel priorityLevel = Todo.PriorityLevel.valueOf(priority.toUpperCase());
        return ResponseEntity.ok(todoService.getTodosByPriority(priorityLevel, authentication.getName()));
    }
}