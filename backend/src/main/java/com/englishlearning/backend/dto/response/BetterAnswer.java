package com.englishlearning.backend.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BetterAnswer {
    private String text;
    private String description;
}
