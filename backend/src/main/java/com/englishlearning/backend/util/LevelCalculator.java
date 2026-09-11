package com.englishlearning.backend.util;

public class LevelCalculator {

    // ✅ BẢNG MỐC XP CỐ ĐỊNH - INDEX = LEVEL
    private static final int[] XP_MILESTONES = {
            0,           // Index 0 - không dùng
            0,           // Level 1
            300,         // Level 2
            700,         // Level 3
            1200,        // Level 4
            1800,        // Level 5
            2500,        // Level 6
            3300,        // Level 7
            4200,        // Level 8
            5200,        // Level 9
            6300,        // Level 10
            7500,        // Level 11
            8900,        // Level 12
            10500,       // Level 13
            12300,       // Level 14
            14300,       // Level 15
            16500,       // Level 16
            18900,       // Level 17
            21500,       // Level 18
            24400,       // Level 19
            27600,       // Level 20
            31200,       // Level 21
            35200,       // Level 22
            39600,       // Level 23
            44500,       // Level 24
            49900,       // Level 25
            55800,       // Level 26
            62300,       // Level 27
            69500,       // Level 28
            79900,       // Level 29
            90000        // Level 30 - MAX
    };

    private static final int MAX_LEVEL = 30;

    // =====================================================
    // TÍNH LEVEL TỪ XP
    // =====================================================

    /**
     * Tính level hiện tại từ tổng XP
     *
     * Ví dụ:
     * - 0 XP → Level 1
     * - 299 XP → Level 1 (chưa đủ 300 để lên Level 2)
     * - 300 XP → Level 2
     * - 90,000 XP → Level 30 (max)
     */
    public static int getLevelFromXp(int totalXp) {
        if (totalXp < 0) return 1;

        for (int level = MAX_LEVEL; level >= 1; level--) {
            if (totalXp >= XP_MILESTONES[level]) {
                return level;
            }
        }

        return 1;
    }

    /**
     * Lấy mốc XP của 1 level cụ thể
     */
    public static int getXpMilestone(int level) {
        if (level < 1) return 0;
        if (level > MAX_LEVEL) return XP_MILESTONES[MAX_LEVEL];
        return XP_MILESTONES[level];
    }

    /**
     * XP cần để lên level tiếp theo (từ level hiện tại)
     */
    public static int getXpForNextLevel(int currentLevel) {
        if (currentLevel >= MAX_LEVEL) return 0;
        return XP_MILESTONES[currentLevel + 1] - XP_MILESTONES[currentLevel];
    }

    /**
     * Tổng XP cần để đạt 1 level cụ thể (chính là mốc XP)
     */
    public static int getTotalXpForLevel(int level) {
        return getXpMilestone(level);
    }

    /**
     * % tiến độ trong level hiện tại
     */
    public static double getProgressPercent(int totalXp) {
        int currentLevel = getLevelFromXp(totalXp);

        if (currentLevel >= MAX_LEVEL) {
            return 100.0;
        }

        int xpStartOfLevel = XP_MILESTONES[currentLevel];
        int xpEndOfLevel = XP_MILESTONES[currentLevel + 1];
        int levelRange = xpEndOfLevel - xpStartOfLevel;

        if (levelRange <= 0) return 100.0;

        int xpInCurrentLevel = totalXp - xpStartOfLevel;
        double percent = (xpInCurrentLevel * 100.0) / levelRange;

        return Math.min(Math.max(percent, 0.0), 100.0);
    }

    /**
     * XP đã kiếm trong level hiện tại
     */
    public static int getCurrentXpInLevel(int totalXp) {
        int currentLevel = getLevelFromXp(totalXp);
        int xpStartOfLevel = XP_MILESTONES[currentLevel];
        return totalXp - xpStartOfLevel;
    }

    /**
     * XP cần để lên level tiếp theo (từ XP hiện có)
     */
    public static int getXpRemaining(int totalXp) {
        int currentLevel = getLevelFromXp(totalXp);

        if (currentLevel >= MAX_LEVEL) {
            return 0;
        }

        int xpEndOfLevel = XP_MILESTONES[currentLevel + 1];
        return Math.max(0, xpEndOfLevel - totalXp);
    }

    /**
     * Tổng XP cần để đạt level tiếp theo
     */
    public static int getTotalXpForNextLevel(int totalXp) {
        int currentLevel = getLevelFromXp(totalXp);
        if (currentLevel >= MAX_LEVEL) return XP_MILESTONES[MAX_LEVEL];
        return XP_MILESTONES[currentLevel + 1];
    }

    /**
     * XP cần cho level hiện tại (độ dài của level)
     */
    public static int getLevelRange(int currentLevel) {
        if (currentLevel < 1) return 0;
        if (currentLevel >= MAX_LEVEL) return 0;
        return XP_MILESTONES[currentLevel + 1] - XP_MILESTONES[currentLevel];
    }

    // =====================================================
    // TITLE THEO LEVEL
    // =====================================================

    public static String getTitleForLevel(int level) {
        if (level <= 4)  return "Tân binh";
        if (level <= 9)  return "Học viên";
        if (level <= 14) return "Học giả";
        if (level <= 19) return "Chuyên gia";
        if (level <= 24) return "Cao thủ";
        if (level <= 29) return "Đại sư";
        return "Thần thoại";
    }

    public static String getTitleEmoji(int level) {
        if (level <= 4)  return "🌱";
        if (level <= 9)  return "📚";
        if (level <= 14) return "⭐";
        if (level <= 19) return "🎓";
        if (level <= 24) return "🏆";
        if (level <= 29) return "👑";
        return "🔥";
    }

    public static String getLevelColor(int level) {
        if (level <= 4)  return "#22c55e";
        if (level <= 9)  return "#3b82f6";
        if (level <= 14) return "#a855f7";
        if (level <= 19) return "#f59e0b";
        if (level <= 24) return "#ef4444";
        if (level <= 29) return "#eab308";
        return "#f43f5e";
    }

    public static int getMaxLevel() {
        return MAX_LEVEL;
    }
}