package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentMembershipCreateRequest {

    @NotNull(message = "Vui lòng chọn gói thành viên")
    private Long membershipPackageId;
}