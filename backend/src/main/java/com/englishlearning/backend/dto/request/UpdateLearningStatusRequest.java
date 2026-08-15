package com.englishlearning.backend.dto.request;
import com.englishlearning.backend.enums.LearningStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateLearningStatusRequest {

    private LearningStatus status;
}