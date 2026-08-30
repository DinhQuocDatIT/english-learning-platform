package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ListeningAnswerRequest;
import com.englishlearning.backend.dto.response.ListeningAnswerResponse;
import com.englishlearning.backend.entity.ListeningAnswer;
import com.englishlearning.backend.entity.ListeningSentence;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.ListeningAnswerRepository;
import com.englishlearning.backend.repository.ListeningSentenceRepository;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.service.ListeningAnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ListeningAnswerServiceImpl implements ListeningAnswerService {

    private static final int XP_PER_CORRECT_ANSWER = 10;

    private final ListeningAnswerRepository listeningAnswerRepository;
    private final ListeningSentenceRepository listeningSentenceRepository;
    private final StudentRepository studentRepository;

    @Override
    public ListeningAnswerResponse answerQuestion(
            Long userId,
            ListeningAnswerRequest request
    ) {
        Student student = getStudentByUserId(userId);
        ListeningSentence sentence = getSentence(
                request.getListeningSentenceId()
        );
        String normalizedUserText = normalizeText(request.getUserText());
        String normalizedCorrectText = normalizeText(sentence.getEnglishText());
        boolean isCorrect = normalizedUserText.equals(normalizedCorrectText);
        ListeningAnswer answer = listeningAnswerRepository
                .findByStudentIdAndListeningSentenceId(
                        student.getId(),
                        sentence.getId()
                )
                .orElse(null);
        boolean hasEverBeenCorrect = answer != null && answer.getCompletedAt() != null;

        int experienceEarned = 0;


        if (!hasEverBeenCorrect && isCorrect) {

            student.addExperience(XP_PER_CORRECT_ANSWER);
            studentRepository.save(student);
            experienceEarned = XP_PER_CORRECT_ANSWER;
        } else if (hasEverBeenCorrect) {

            experienceEarned = 0;
        }


        if (answer == null) {
            answer = new ListeningAnswer();
            answer.setListeningSentence(sentence);
            answer.setStudent(student);
            answer.setCreatedAt(LocalDateTime.now());
        }


        answer.setUserText(request.getUserText());
        answer.setCorrectText(sentence.getEnglishText());
        answer.setIsCorrect(isCorrect);


        if (answer.getCompletedAt() == null && isCorrect) {
            answer.setCompletedAt(LocalDateTime.now());
        }
        ListeningAnswer saved = listeningAnswerRepository.save(answer);

        return toResponse(saved, experienceEarned);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningAnswerResponse> getStudentAnswers(Long userId) {

        Student student = getStudentByUserId(userId);

        return listeningAnswerRepository
                .findAllByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(a -> toResponse(a, 0))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningAnswerResponse> getStudentAnswersByLesson(
            Long userId,
            Long lessonId
    ) {

        Student student = getStudentByUserId(userId);

        return listeningAnswerRepository
                .findAllByStudentIdAndLessonId(student.getId(), lessonId)
                .stream()
                .map(a -> toResponse(a, 0))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ListeningAnswerResponse getStudentAnswerBySentence(
            Long userId,
            Long sentenceId
    ) {

        Student student = getStudentByUserId(userId);
        getSentence(sentenceId);

        return listeningAnswerRepository
                .findByStudentIdAndListeningSentenceId(student.getId(), sentenceId)
                .map(a -> toResponse(a, 0))
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSentenceCompleted(Long userId, Long sentenceId) {

        Student student = getStudentByUserId(userId);

        return listeningAnswerRepository
                .findByStudentIdAndListeningSentenceId(student.getId(), sentenceId)
                .map(answer -> answer.getCompletedAt() != null)
                .orElse(false);
    }

    @Override
    @Transactional
    public void resetLessonAnswers(Long userId, Long lessonId) {
        Student student = getStudentByUserId(userId);

        List<ListeningAnswer> answers = listeningAnswerRepository
                .findAllByStudentIdAndLessonId(student.getId(), lessonId);

        if (answers.isEmpty()) {
            return;
        }


        for (ListeningAnswer answer : answers) {
            answer.setIsCorrect(false);
            answer.setCompletedAt(null);
            answer.setUserText(null);

        }

        listeningAnswerRepository.saveAll(answers);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isLessonCompleted(Long userId, Long lessonId) {
        Student student = getStudentByUserId(userId);

        List<ListeningSentence> sentences = listeningSentenceRepository
                .findAllByLessonId(lessonId);

        if (sentences.isEmpty()) {
            return false;
        }

        long completedCount = sentences.stream()
                .filter(sentence -> {
                    return listeningAnswerRepository
                            .findByStudentIdAndListeningSentenceId(student.getId(), sentence.getId())
                            .map(answer -> answer.getCompletedAt() != null)
                            .orElse(false);
                })
                .count();


        return completedCount == sentences.size();
    }

    @Override
    @Transactional(readOnly = true)
    public int getCompletedCountInLesson(Long userId, Long lessonId) {
        Student student = getStudentByUserId(userId);

        // Lấy tất cả sentences trong lesson
        List<ListeningSentence> sentences = listeningSentenceRepository
                .findAllByLessonId(lessonId);

        if (sentences.isEmpty()) {
            return 0;
        }

        // Đếm số câu đã hoàn thành
        long completedCount = sentences.stream()
                .filter(sentence -> {
                    return listeningAnswerRepository
                            .findByStudentIdAndListeningSentenceId(student.getId(), sentence.getId())
                            .map(answer -> answer.getCompletedAt() != null)
                            .orElse(false);
                })
                .count();

        return (int) completedCount;
    }


    private Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy student với userId: " + userId));
    }

    private Student getStudent(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học sinh"));
    }

    private ListeningSentence getSentence(Long sentenceId) {
        return listeningSentenceRepository.findById(sentenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi"));
    }

    private String normalizeText(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[.,!?;:'\"()]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private ListeningAnswerResponse toResponse(ListeningAnswer answer, int experienceEarned) {

        return ListeningAnswerResponse.builder()
                .id(answer.getId())
                .listeningSentenceId(answer.getListeningSentence().getId())
                .listeningSentenceText(answer.getListeningSentence().getEnglishText())
                .studentId(answer.getStudent().getId())
                .studentName(answer.getStudent().getUser().getFullName())
                .userText(answer.getUserText())
                .correctText(answer.getCorrectText())
                .isCorrect(answer.getIsCorrect())
                .createdAt(answer.getCreatedAt())
                .completedAt(answer.getCompletedAt())
                .experienceEarned(experienceEarned)
                .build();
    }
}