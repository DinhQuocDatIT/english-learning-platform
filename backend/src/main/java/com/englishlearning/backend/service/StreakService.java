package com.englishlearning.backend.service;


import com.englishlearning.backend.entity.Student;

public interface StreakService {
    void recordActivity(Student student);
    int getDisplayStreak(Student student);
    int getLongestStreak(Student student);
}