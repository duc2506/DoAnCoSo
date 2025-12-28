package com.example.todo.repository;

import com.example.todo.model.Todo;
import com.example.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUserOrderByCreatedAtDesc(User user);
    
    List<Todo> findByUserAndCompletedOrderByCreatedAtDesc(User user, boolean completed);
    
    @Query("SELECT t FROM Todo t WHERE t.user = ?1 AND (t.title LIKE %?2% OR t.description LIKE %?2%)")
    List<Todo> searchByTitleOrDescription(User user, String keyword);
    
    @Query("SELECT t FROM Todo t JOIN t.categories c WHERE t.user = ?1 AND c.id = ?2")
    List<Todo> findByUserAndCategory(User user, Long categoryId);
    
    List<Todo> findByUserAndPriorityLevelOrderByCreatedAtDesc(User user, Todo.PriorityLevel priorityLevel);
}