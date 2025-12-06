package com.legalyze.backendd.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    private String userEmail;   // identifies which user owns the review
    private String title;
    private int aiInsights;
    private LocalDateTime createdAt;

    public Review() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getAiInsights() { return aiInsights; }
    public void setAiInsights(int aiInsights) { this.aiInsights = aiInsights; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
