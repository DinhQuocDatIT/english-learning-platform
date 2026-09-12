package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StudyActivitiesResponse {

    private Long total;
    private List<Activity> activities;

    @Getter
    @Builder
    public static class Activity {
        private String key;
        private String name;
        private Long value;
        private String color;
    }
}