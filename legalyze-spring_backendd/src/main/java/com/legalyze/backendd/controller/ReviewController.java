package com.legalyze.backendd.controller;



import com.legalyze.backendd.model.Review;
import com.legalyze.backendd.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/{email}")
    public List<Review> getReviewsByUser(@PathVariable String email) {
        return reviewRepository.findByUserEmail(email);
    }

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return reviewRepository.save(review);
    }

    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable String id) {
        reviewRepository.deleteById(id);
    }
}
