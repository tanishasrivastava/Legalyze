package com.legalyze.backendd.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.legalyze.backendd.model.NewsletterSubscriber;

public interface NewsletterRepository extends MongoRepository<NewsletterSubscriber, String> {
}
