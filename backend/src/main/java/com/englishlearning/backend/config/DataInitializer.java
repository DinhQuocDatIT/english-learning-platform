package com.englishlearning.backend.config;

import com.englishlearning.backend.entity.Role;
import com.englishlearning.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        createRoleIfNotExist(
                "ADMIN",
                "Quản trị viên hệ thống"
        );

        createRoleIfNotExist(
                "TEACHER",
                "Giáo viên tạo nội dung học"
        );

        createRoleIfNotExist(
                "STUDENT",
                "Người học tiếng Anh"
        );

    }
    private void createRoleIfNotExist(
            String name,
            String description
    ){

        if(!roleRepository.existsByName(name)){

            Role role = new Role();

            role.setName(name);
            role.setDescription(description);

            roleRepository.save(role);
        }

    }
}