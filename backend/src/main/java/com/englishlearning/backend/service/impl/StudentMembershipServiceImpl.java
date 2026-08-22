package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.StudentMembershipCreateRequest;
import com.englishlearning.backend.dto.response.StudentMembershipResponse;
import com.englishlearning.backend.entity.MembershipPackage;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.StudentMembership;
import com.englishlearning.backend.enums.MembershipPackageStatus;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.MembershipPackageRepository;
import com.englishlearning.backend.repository.StudentMembershipRepository;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.service.StudentMembershipService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@Transactional
public class StudentMembershipServiceImpl
        implements StudentMembershipService {

    private final StudentMembershipRepository studentMembershipRepository;
    private final StudentRepository studentRepository;
    private final MembershipPackageRepository membershipPackageRepository;

    public StudentMembershipServiceImpl(
            StudentMembershipRepository studentMembershipRepository,
            StudentRepository studentRepository,
            MembershipPackageRepository membershipPackageRepository
    ) {
        this.studentMembershipRepository = studentMembershipRepository;
        this.studentRepository = studentRepository;
        this.membershipPackageRepository = membershipPackageRepository;
    }

    @Override
    public StudentMembershipResponse register(
            Long userId,
            StudentMembershipCreateRequest request
    ) {

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy thông tin học viên"
                        )
                );

        MembershipPackage membershipPackage =
                membershipPackageRepository
                        .findByIdAndStatus(
                                request.getMembershipPackageId(),
                                MembershipPackageStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Gói thành viên không tồn tại hoặc đã ngừng sử dụng"
                                )
                        );

        Optional<StudentMembership> currentMembership =
                studentMembershipRepository
                        .findFirstByStudentIdAndStatusOrderByEndDateDesc(
                                student.getId(),
                                StudentMembershipStatus.ACTIVE
                        );

        LocalDate today = LocalDate.now();

        if (currentMembership.isPresent()) {

            StudentMembership current =
                    currentMembership.get();

            if (!current.getEndDate().isBefore(today)) {

                throw new BusinessException(
                        "Bạn đang có gói thành viên còn hiệu lực đến "
                                + current.getEndDate()
                );
            }

            current.setStatus(
                    StudentMembershipStatus.EXPIRED
            );

            studentMembershipRepository.save(current);
        }

        LocalDate startDate = today;

        LocalDate endDate = startDate.plusDays(
                membershipPackage.getDuration()
        );

        StudentMembership membership =
                new StudentMembership();

        membership.setStudent(student);

        membership.setMembershipPackage(
                membershipPackage
        );

        membership.setStatus(
                StudentMembershipStatus.ACTIVE
        );

        membership.setPaidPrice(
                membershipPackage.getPrice()
        );

        membership.setStartDate(startDate);

        membership.setEndDate(endDate);

        StudentMembership saved =
                studentMembershipRepository.save(
                        membership
                );

        return toResponse(saved);
    }

    @Override
    public StudentMembershipResponse getCurrentMembership(
            Long userId
    ) {

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy thông tin học viên"
                        )
                );

        Optional<StudentMembership> membership =
                studentMembershipRepository
                        .findFirstByStudentIdAndStatusOrderByEndDateDesc(
                                student.getId(),
                                StudentMembershipStatus.ACTIVE
                        );

        if (membership.isEmpty()) {
            return null;
        }

        StudentMembership current =
                membership.get();

        LocalDate today = LocalDate.now();

        if (current.getEndDate().isBefore(today)) {

            current.setStatus(
                    StudentMembershipStatus.EXPIRED
            );

            studentMembershipRepository.save(current);

            return null;
        }

        long remainingDays =
                ChronoUnit.DAYS.between(
                        today,
                        current.getEndDate()
                );

        return toResponse(
                current,
                remainingDays
        );
    }

    private StudentMembershipResponse toResponse(
            StudentMembership membership
    ) {

        LocalDate today = LocalDate.now();

        long remainingDays =
                ChronoUnit.DAYS.between(
                        today,
                        membership.getEndDate()
                );

        return toResponse(
                membership,
                Math.max(remainingDays, 0)
        );
    }

    private StudentMembershipResponse toResponse(
            StudentMembership membership,
            long remainingDays
    ) {

        MembershipPackage membershipPackage =
                membership.getMembershipPackage();

        return StudentMembershipResponse.builder()
                .id(membership.getId())
                .packageId(membershipPackage.getId())
                .packageName(membershipPackage.getName())
                .paidPrice(membership.getPaidPrice())
                .status(membership.getStatus())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .remainingDays(remainingDays)
                .build();
    }
}