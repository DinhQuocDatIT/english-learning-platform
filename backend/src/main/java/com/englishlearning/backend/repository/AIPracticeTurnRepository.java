package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIPracticeTurn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIPracticeTurnRepository extends JpaRepository<AIPracticeTurn, Long> {
    List<AIPracticeTurn> findByPracticeChatIdOrderByQuestionOrderAsc(Long practiceChatId);
    Optional<AIPracticeTurn> findByPracticeChatIdAndQuestionOrder(Long practiceChatId, Integer questionOrder);
    // Lấy turn hiện tại (chưa có answer)
    @Query("SELECT t FROM AIPracticeTurn t WHERE t.practiceChat.id = :chatId AND t.answer IS NULL ORDER BY t.questionOrder ASC")
    Optional<AIPracticeTurn> findCurrentTurnByChatId(@Param("chatId") Long chatId);
    long countByPracticeChatId(Long practiceChatId);
}