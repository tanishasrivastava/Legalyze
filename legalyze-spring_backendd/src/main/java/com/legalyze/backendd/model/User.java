package com.legalyze.backendd.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * User entity stored in MongoDB.
 * Represents a system user with role-based access.
 */
@Document(collection = "users")
public class User {

    @Id
    private String id;       // Auto-generated MongoDB _id field
    private String name;     // Full name of the user
    private String email;    // Unique email ID (used for login)
    private String password; // Encrypted password (BCrypt hashed)
    private String role;     // User role: ADMIN, LAWYER, CLIENT

    // ✅ Default constructor
    public User() {}

    // ✅ Parameterized constructor
    public User(String id, String name, String email, String password, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ✅ Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // ✅ toString method (helpful for debugging/logging)
    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
