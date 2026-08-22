package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
        public Optional<User> findByEmail(String email);
        public boolean existsByEmail(String email);
        List<User> findByRole_Name(String roleName);
        Page<User> findByRole_Name(String roleName, Pageable pageable);
        @Query("""
    SELECT u
    FROM User u
    WHERE u.role.name = :roleName
      AND (
          LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR CAST(u.id AS string) LIKE CONCAT('%', :keyword, '%')
      )
""")
        Page<User> searchTeachers(
                @Param("roleName") String roleName,
                @Param("keyword") String keyword,
                Pageable pageable
        );
        @Query("""
    SELECT u
    FROM User u
    WHERE u.role.name = :roleName
      AND (
          LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR CAST(u.id AS string) LIKE CONCAT('%', :keyword, '%')
      )
""")
        Page<User> searchStudents(
                @Param("roleName") String roleName,
                @Param("keyword") String keyword,
                Pageable pageable
        );
}
