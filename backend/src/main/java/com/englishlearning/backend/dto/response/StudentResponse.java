package com.englishlearning.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String fullName;
    private String email;
    private String gender;
    private LocalDate dateOfBirth;
    private String role;
    private Integer experience;
    private Integer totalLearningSeconds;
    private Integer totalCompletedTopic;
    private LocalDateTime createdAt;

}
