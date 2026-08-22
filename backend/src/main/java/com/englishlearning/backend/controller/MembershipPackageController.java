package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.MembershipPackageCreateRequest;
import com.englishlearning.backend.dto.request.MembershipPackageUpdateRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.MembershipPackageResponse;
import com.englishlearning.backend.dto.response.MembershipPackageStatsResponse;
import com.englishlearning.backend.service.MembershipPackageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/membership-packages")
public class MembershipPackageController {

    @Autowired
    private MembershipPackageService membershipPackageService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<MembershipPackageResponse>>> getActivePackages() {

        List<MembershipPackageResponse> responses =
                membershipPackageService.getActivePackages();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách gói thành viên đang hoạt động thành công",
                        responses
                )
        );
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipPackageResponse>>> getAll() {

        List<MembershipPackageResponse> responses =
                membershipPackageService.getAllWithStatistics();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách gói thành viên thành công",
                        responses
                )
        );
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<MembershipPackageStatsResponse>> getStats() {

        MembershipPackageStatsResponse response =
                membershipPackageService.getStats();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thống kê gói thành viên thành công",
                        response
                )
        );
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipPackageResponse>> getById(
            @PathVariable Long id
    ) {

        MembershipPackageResponse response =
                membershipPackageService.getById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin gói thành viên thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<MembershipPackageResponse>> create(
            @Valid @RequestBody MembershipPackageCreateRequest request
    ) {

        MembershipPackageResponse response =
                membershipPackageService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        201,
                        "Thêm gói thành viên thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipPackageResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MembershipPackageUpdateRequest request
    ) {

        MembershipPackageResponse response =
                membershipPackageService.update(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật gói thành viên thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> delete(
            @PathVariable Long id
    ) {

        membershipPackageService.delete(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Xóa gói thành viên thành công",
                        true
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<MembershipPackageResponse>> deactivate(
            @PathVariable Long id
    ) {

        MembershipPackageResponse response =
                membershipPackageService.deactivate(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Ngừng sử dụng gói thành viên thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<MembershipPackageResponse>> activate(
            @PathVariable Long id
    ) {

        MembershipPackageResponse response =
                membershipPackageService.activate(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Kích hoạt lại gói thành viên thành công",
                        response
                )
        );
    }
}