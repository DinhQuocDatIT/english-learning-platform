package com.englishlearning.backend.dto.grammar.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarEditRequestCreateRequest {

    @NotBlank(message = "Vui lòng nhập lý do")
    @Size(max = 1000, message = "Lý do tối đa 1000 ký tự")
    private String reason;
}