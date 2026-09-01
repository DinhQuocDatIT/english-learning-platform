package com.englishlearning.backend.constant;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class PracticeConstants {

    public static final Set<String> VALID_LEVELS = new HashSet<>(
            Arrays.asList("A1", "A2", "B1", "B2", "C1", "C2")
    );

    public static final Set<String> VALID_SENTENCE_TYPES = new HashSet<>(
            Arrays.asList("QUESTION", "ANSWER", "RANDOM")
    );

    public static final Set<String> VALID_TOPICS = new HashSet<>(
            Arrays.asList(
                    "DAILY_CONVERSATION",
                    "SHOPPING",
                    "RESTAURANT",
                    "TRAVEL",
                    "WORK",
                    "SCHOOL",
                    "FAMILY",
                    "FRIENDS"
            )
    );

    public static final Set<Integer> VALID_QUESTION_LIMITS = new HashSet<>(
            Arrays.asList(10, 20, 30, 50)
    );

    public static final int DEFAULT_QUESTION_LIMIT = 20;
    public static final int MAX_QUESTION_LIMIT = 50;
    public static final int MIN_QUESTION_LIMIT = 10;
    public static final int MAX_ANSWER_LENGTH = 1000;
    public static final int WEAKNESS_THRESHOLD = 50;
    public static final int MAX_WEAKNESSES = 5;
}