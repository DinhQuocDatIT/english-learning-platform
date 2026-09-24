package com.englishlearning.backend.util;


public class XpCalculator {

    private static final int XP_A1 = 10;
    private static final int XP_A2 = 12;
    private static final int XP_B1 = 15;
    private static final int XP_B2 = 18;
    private static final int XP_C1 = 22;
    private static final int XP_C2 = 25;


    public static int getXpForAiPractice(String level) {
        if (level == null || level.isBlank()) return XP_B1;
        switch (level.toUpperCase().trim()) {
            case "A1": return XP_A1;
            case "A2": return XP_A2;
            case "B1": return XP_B1;
            case "B2": return XP_B2;
            case "C1": return XP_C1;
            case "C2": return XP_C2;
            default:   return XP_B1;
        }
    }


    public static int calculateAiPracticeXp(String level, boolean isCorrect) {
        if (!isCorrect) return 0;
        return getXpForAiPractice(level);
    }

    public static final int XP_PER_LISTENING_CORRECT = 10;
}