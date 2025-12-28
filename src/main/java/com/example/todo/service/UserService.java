package com.example.todo.service;

import com.example.todo.dto.UserDTO;
import com.example.todo.model.User;
import com.example.todo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setFullName(userDTO.getFullName());

        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public UserDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        // Password is not included in response

        return userDTO;
    }

    @Transactional
    public UserDTO updateProfile(String username, UserDTO userDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is changed and not already in use
        if (!user.getEmail().equals(userDTO.getEmail()) && 
            userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        user.setEmail(userDTO.getEmail());
        user.setFullName(userDTO.getFullName());

        // Update password if provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        UserDTO updatedDTO = new UserDTO();
        updatedDTO.setId(updatedUser.getId());
        updatedDTO.setUsername(updatedUser.getUsername());
        updatedDTO.setEmail(updatedUser.getEmail());
        updatedDTO.setFullName(updatedUser.getFullName());

        return updatedDTO;
    }
}
