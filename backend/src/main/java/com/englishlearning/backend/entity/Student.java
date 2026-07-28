package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long  id;
    @Column(nullable = false ,columnDefinition = "INT DEFAULT 0" )
    private Integer experience = 0;
    @Column(nullable = false ,columnDefinition = "INT DEFAULT 0")
    private Integer totalLearningSeconds = 0;
    @Column(nullable = false,columnDefinition = "INT DEFAULT 0")
    private Integer totalCompletedTopic = 0;
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    @OneToOne
    @JoinColumn(name = "user_id" , nullable = false,
    unique = true)
    private User user;

    public  Student(){}

    public Student(Long  id, Integer experience, Integer totalLearningSeconds, Integer totalCompletedTopic, LocalDateTime createdAt, LocalDateTime updatedAt, User user) {
        this.id = id;
        this.experience = experience;
        this.totalLearningSeconds = totalLearningSeconds;
        this.totalCompletedTopic = totalCompletedTopic;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user = user;
    }

    public Long  getId() {
        return id;
    }

    public void setId(Long  id) {
        this.id = id;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public Integer getTotalLearningSeconds() {
        return totalLearningSeconds;
    }

    public void setTotalLearningSeconds(Integer totalLearningSeconds) {
        this.totalLearningSeconds = totalLearningSeconds;
    }

    public Integer getTotalCompletedTopic() {
        return totalCompletedTopic;
    }

    public void setTotalCompletedTopic(Integer totalCompletedTopic) {
        this.totalCompletedTopic = totalCompletedTopic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
