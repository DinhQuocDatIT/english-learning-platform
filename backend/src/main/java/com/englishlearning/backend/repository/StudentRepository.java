package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    @Query("""
        SELECT COUNT(s) FROM Student s
        WHERE s.experience > :xp
    """)
    long countStudentsWithHigherXp(@Param("xp") int xp);

    /**
     * Đếm số học viên CÙNG XP nhưng ID nhỏ hơn
     * (dùng để tie-break, đảm bảo ranking ổn định)
     */
    @Query("""
        SELECT COUNT(s) FROM Student s
        WHERE s.experience = :xp AND s.id < :studentId
    """)
    long countStudentsWithSameXpButLowerId(
            @Param("xp") int xp,
            @Param("studentId") Long studentId
    );
}
