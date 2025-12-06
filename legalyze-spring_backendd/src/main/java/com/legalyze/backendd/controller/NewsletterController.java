package com.legalyze.backendd.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.legalyze.backendd.model.NewsletterSubscriber;
import com.legalyze.backendd.repository.NewsletterRepository;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "*")
public class NewsletterController {

    @Autowired
    private NewsletterRepository repository;

    @PostMapping("/subscribe")
    public NewsletterSubscriber subscribe(@RequestBody NewsletterSubscriber subscriber) {
        return repository.save(subscriber);
    }
}
