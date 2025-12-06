package com.legalyze.backendd.repository;
import com.legalyze.backendd.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByUserEmail(String userEmail);

	List<Review> findByUserEmail(String email);
}