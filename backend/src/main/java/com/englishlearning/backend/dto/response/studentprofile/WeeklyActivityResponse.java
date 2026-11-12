package com.englishlearning.backend.dto.response.studentprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyActivityResponse {

    private LocalDate date;

    /**
     * Tổng hoạt động = practiceCount + conversationCount
     * (giữ lại để backward-compatible)
     */
    private Long questionCount;

    /**
     * Số câu luyện dịch (AI Practice) đã trả lời trong ngày
     */
    private Long practiceCount;

    /**
     * Số tin nhắn USER gửi trong Conversation trong ngày
     */
    private Long conversationCount;
}