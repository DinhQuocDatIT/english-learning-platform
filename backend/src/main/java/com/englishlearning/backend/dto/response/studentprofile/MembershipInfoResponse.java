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
public class MembershipInfoResponse {

    private Boolean hasMembership;

    private String packageName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long remainingDays;

    private AiUsageInfo aiUsage;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiUsageInfo {
        private Integer limit;
        private Integer used;
        private Integer remaining;
        private Double percent;
        private Boolean canMakeRequest;
    }
}