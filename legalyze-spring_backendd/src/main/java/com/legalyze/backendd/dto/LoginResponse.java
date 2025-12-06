package com.legalyze.backendd.dto;
public class LoginResponse {
    private String token;
    private String role;
    private String name;

    // Default constructor
    public LoginResponse() {}

    public LoginResponse(String token, String role, String name) {
        this.token = token;
        this.role = role;
        this.name = name;
    }

    // Getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}