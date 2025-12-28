package com.example.todo.dto;

import com.example.todo.model.Todo;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    private boolean completed;
    private Todo.PriorityLevel priorityLevel;
    private Set<Long> categoryIds;
}