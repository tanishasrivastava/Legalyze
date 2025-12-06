package com.legalyze.backendd.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "newsletter_subscribers")
public class NewsletterSubscriber {

    @Id
    private String id;
    private String email;

    // getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
