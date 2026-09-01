package com.englishlearning.backend.exception;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    STUDENT_NOT_FOUND("STUDENT_001", "Student not found"),

    // Practice errors
    PRACTICE_NOT_FOUND("PRACTICE_001", "Practice chat not found"),
    PRACTICE_COMPLETED("PRACTICE_002", "Practice chat is already completed"),
    PRACTICE_NOT_IN_PROGRESS("PRACTICE_003", "Practice chat is not in progress"),
    PRACTICE_LIMIT_REACHED("PRACTICE_004", "Question limit reached"),

    // Turn errors
    TURN_NOT_FOUND("TURN_001", "Turn not found"),
    TURN_ALREADY_ANSWERED("TURN_002", "This turn has already been answered"),
    TURN_NOT_BELONG_TO_CHAT("TURN_003", "Turn does not belong to this practice chat"),

    // Validation errors
    INVALID_LEVEL("VALID_001", "Invalid level. Must be A1, A2, B1, B2, C1, C2"),
    INVALID_TOPIC("VALID_002", "Invalid topic"),
    INVALID_SENTENCE_TYPE("VALID_003", "Invalid sentence type. Must be QUESTION, ANSWER, RANDOM"),
    INVALID_QUESTION_LIMIT("VALID_004", "Question limit must be 10, 20, 30, or 50"),

    // AI errors
    AI_SERVICE_ERROR("AI_001", "AI service error"),
    AI_RESPONSE_PARSE_ERROR("AI_002", "Failed to parse AI response"),

    // Quota errors
    QUOTA_EXCEEDED("QUOTA_001", "AI request quota exceeded");

    private final String code;
    private final String message;
}
