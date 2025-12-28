package com.example.todo.controller;

import com.example.todo.dto.UserDTO;
import com.example.todo.model.User;
import com.example.todo.security.JwtTokenProvider;
import com.example.todo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtTokenProvider tokenProvider, 
                          UserService userService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.get("username"),
                loginRequest.get("password")
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", authentication.getName());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDTO userDTO) {
        User user = userService.registerUser(userDTO);

        Map<String, String> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("message", "User registered successfully");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(Authentication authentication, 
                                              @Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), userDTO));
    }
}