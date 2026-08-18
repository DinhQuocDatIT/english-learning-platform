package com.englishlearning.backend.service;


import com.englishlearning.backend.dto.request.MembershipPackageCreateRequest;
import com.englishlearning.backend.dto.request.MembershipPackageUpdateRequest;
import com.englishlearning.backend.dto.response.MembershipPackageResponse;

import java.util.List;

public interface MembershipPackageService {

    List<MembershipPackageResponse> getAll();

    List<MembershipPackageResponse> getActivePackages();

    MembershipPackageResponse getById(Long id);

    MembershipPackageResponse create(
            MembershipPackageCreateRequest request
    );

    MembershipPackageResponse update(
            Long id,
            MembershipPackageUpdateRequest request
    );

    void delete(Long id);

    MembershipPackageResponse deactivate(Long id);

    MembershipPackageResponse activate(Long id);
}