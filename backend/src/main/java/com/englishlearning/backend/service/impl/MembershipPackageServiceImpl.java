package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.MembershipPackageCreateRequest;
import com.englishlearning.backend.dto.request.MembershipPackageUpdateRequest;
import com.englishlearning.backend.dto.response.MembershipPackageResponse;
import com.englishlearning.backend.entity.MembershipPackage;
import com.englishlearning.backend.enums.MembershipPackageStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.MembershipPackageRepository;
import com.englishlearning.backend.repository.StudentMembershipRepository;
import com.englishlearning.backend.service.MembershipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipPackageServiceImpl
        implements MembershipPackageService {

    private final MembershipPackageRepository membershipPackageRepository;
    private final StudentMembershipRepository studentMembershipRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MembershipPackageResponse> getAll() {

        return membershipPackageRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipPackageResponse> getActivePackages() {

        return membershipPackageRepository
                .findByStatusOrderByCreatedAtDesc(
                        MembershipPackageStatus.ACTIVE
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipPackageResponse getById(Long id) {

        MembershipPackage membershipPackage = findById(id);

        long totalSubscribers =
                studentMembershipRepository
                        .countByMembershipPackageId(id);

        BigDecimal totalRevenue =
                studentMembershipRepository
                        .sumPaidPriceByMembershipPackageId(id);

        return MembershipPackageResponse.builder()
                .id(membershipPackage.getId())
                .name(membershipPackage.getName())
                .duration(membershipPackage.getDuration())
                .price(membershipPackage.getPrice())
                .description(membershipPackage.getDescription())
                .status(membershipPackage.getStatus())
                .isFeatured(membershipPackage.getIsFeatured())
                .totalSubscribers(totalSubscribers)
                .totalRevenue(totalRevenue)
                .createdAt(membershipPackage.getCreatedAt())
                .updatedAt(membershipPackage.getUpdatedAt())
                .build();
    }

    @Override
    public MembershipPackageResponse create(
            MembershipPackageCreateRequest request
    ) {

        String name = request.getName().trim();

        if (membershipPackageRepository
                .existsByNameIgnoreCase(name)) {

            throw new BusinessException(
                    "Tên gói thành viên đã tồn tại"
            );
        }

        MembershipPackage membershipPackage =
                new MembershipPackage();

        membershipPackage.setName(name);
        membershipPackage.setDuration(
                request.getDuration()
        );
        membershipPackage.setPrice(
                request.getPrice()
        );
        membershipPackage.setDescription(
                request.getDescription()
        );

        membershipPackage.setStatus(
                MembershipPackageStatus.ACTIVE
        );

        boolean isFeatured =
                Boolean.TRUE.equals(request.getIsFeatured());

        if (isFeatured) {
            clearFeaturedPackages(null);
        }



        membershipPackage.setIsFeatured(isFeatured);

        MembershipPackage saved =
                membershipPackageRepository.save(
                        membershipPackage
                );

        return toResponse(saved);
    }

    @Override
    public MembershipPackageResponse update(
            Long id,
            MembershipPackageUpdateRequest request
    ) {

        MembershipPackage membershipPackage =
                findById(id);

        String name = request.getName().trim();

        if (membershipPackageRepository
                .existsByNameIgnoreCaseAndIdNot(
                        name,
                        id
                )) {

            throw new BusinessException(
                    "Tên gói thành viên đã tồn tại"
            );
        }

        membershipPackage.setName(name);

        membershipPackage.setDuration(
                request.getDuration()
        );

        membershipPackage.setPrice(
                request.getPrice()
        );

        membershipPackage.setDescription(
                request.getDescription()
        );

        boolean isFeatured =
                Boolean.TRUE.equals(request.getIsFeatured());

        if (isFeatured) {
            clearFeaturedPackages(id);
        }

        membershipPackage.setIsFeatured(isFeatured);

        MembershipPackage updated =
                membershipPackageRepository.save(
                        membershipPackage
                );

        return toResponse(updated);
    }

    @Override
    public void delete(Long id) {

        MembershipPackage membershipPackage =
                findById(id);

        boolean hasStudents =
                studentMembershipRepository
                        .existsByMembershipPackageId(id);

        if (hasStudents) {

            throw new BusinessException(
                    "Không thể xóa gói này vì đã có học sinh đăng ký. "
                            + "Hãy ngưng sử dụng gói thay vì xóa."
            );
        }

        membershipPackageRepository.delete(
                membershipPackage
        );
    }

    @Override
    public MembershipPackageResponse deactivate(Long id) {

        MembershipPackage membershipPackage =
                findById(id);

        if (membershipPackage.getStatus()
                == MembershipPackageStatus.INACTIVE) {

            throw new BusinessException(
                    "Gói thành viên này đã ngưng sử dụng"
            );
        }

        membershipPackage.setStatus(
                MembershipPackageStatus.INACTIVE
        );

        if (Boolean.TRUE.equals(
                membershipPackage.getIsFeatured()
        )) {

            membershipPackage.setIsFeatured(false);
        }

        MembershipPackage saved =
                membershipPackageRepository.save(
                        membershipPackage
                );

        return toResponse(saved);
    }

    @Override
    public MembershipPackageResponse activate(Long id) {

        MembershipPackage membershipPackage =
                findById(id);

        if (membershipPackage.getStatus()
                == MembershipPackageStatus.ACTIVE) {

            throw new BusinessException(
                    "Gói thành viên này đang hoạt động"
            );
        }

        membershipPackage.setStatus(
                MembershipPackageStatus.ACTIVE
        );

        MembershipPackage saved =
                membershipPackageRepository.save(
                        membershipPackage
                );

        return toResponse(saved);
    }

    private void clearFeaturedPackages(Long exceptId) {
        membershipPackageRepository.clearFeaturedExcept(exceptId);
    }

    private MembershipPackage findById(Long id) {

        return membershipPackageRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy gói thành viên với id: "
                                        + id
                        )
                );
    }

    private MembershipPackageResponse toResponse(
            MembershipPackage membershipPackage
    ) {

        return MembershipPackageResponse.builder()
                .id(membershipPackage.getId())
                .name(membershipPackage.getName())
                .duration(membershipPackage.getDuration())
                .price(membershipPackage.getPrice())
                .description(membershipPackage.getDescription())
                .status(membershipPackage.getStatus())
                .isFeatured(membershipPackage.getIsFeatured())
                .createdAt(membershipPackage.getCreatedAt())
                .updatedAt(membershipPackage.getUpdatedAt())
                .build();
    }
}