package com.englishlearning.backend.service.impl;


import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.service.StreakService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
public class StreakServiceImpl implements StreakService {

    @Override
    @Transactional
    public void recordActivity(Student student) {
        if (student == null) return;

        LocalDate today = LocalDate.now();
        LocalDate lastActive = student.getLastActiveDate();

        Integer current = student.getCurrentStreak();
        if (current == null) current = 0;

        if (lastActive == null) {
            // Lần đầu tiên học
            student.setCurrentStreak(1);
        } else if (lastActive.equals(today)) {
            // Đã học hôm nay → không đổi
            return;
        } else if (lastActive.equals(today.minusDays(1))) {
            // Học liên tiếp → +1
            student.setCurrentStreak(current + 1);
        } else {
            // Nghỉ > 1 ngày → reset về 1
            student.setCurrentStreak(1);
        }

        // Update longest streak
        int newStreak = student.getCurrentStreak();
        int longest = student.getLongestStreak() != null ? student.getLongestStreak() : 0;
        if (newStreak > longest) {
            student.setLongestStreak(newStreak);
        }

        student.setLastActiveDate(today);

        log.info("🔥 Streak updated: student={}, streak={}, longest={}",
                student.getId(), student.getCurrentStreak(), student.getLongestStreak());
    }

    @Override
    public int getDisplayStreak(Student student) {
        if (student == null || student.getLastActiveDate() == null) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate lastActive = student.getLastActiveDate();

        // Học hôm nay hoặc hôm qua → streak còn valid
        if (lastActive.equals(today) || lastActive.equals(today.minusDays(1))) {
            return student.getCurrentStreak() != null ? student.getCurrentStreak() : 0;
        }

        // Nghỉ > 1 ngày
        return 0;
    }

    @Override
    public int getLongestStreak(Student student) {
        if (student == null || student.getLongestStreak() == null) {
            return 0;
        }
        return student.getLongestStreak();
    }
}