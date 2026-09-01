package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIPracticeChat;
import com.englishlearning.backend.enums.PracticeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIPracticeChatRepository extends JpaRepository<AIPracticeChat, Long> {

    // Lấy danh sách practice chat của student
    List<AIPracticeChat> findByStudentIdAndStatusOrderByCreatedAtDesc(Long studentId, PracticeStatus status);
    List<AIPracticeChat> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    // Đếm số practice đã hoàn thành của student
    long countByStudentIdAndStatus(Long studentId, PracticeStatus status);
    // Lấy practice đang in progress của student
    Optional<AIPracticeChat> findByStudentIdAndStatus(Long studentId, PracticeStatus status);
}