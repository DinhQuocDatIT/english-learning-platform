package com.englishlearning.backend.config;

import com.englishlearning.backend.constant.RoleConstant;
import com.englishlearning.backend.entity.Role;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.repository.RoleRepository;
import com.englishlearning.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createRoleIfNotExist(
                RoleConstant.ADMIN,
                "Quản trị viên hệ thống"
        );

        createRoleIfNotExist(
                RoleConstant.TEACHER,
                "Giáo viên tạo nội dung học"
        );

        createRoleIfNotExist(
                RoleConstant.STUDENT,
                "Người học tiếng Anh"
        );
        createAdminIfNotExist();

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
    private void createAdminIfNotExist(){


        String adminEmail = "admin@gmail.com";


        if(userRepository.existsByEmail(adminEmail)){
            return;
        }


        Role adminRole =
                roleRepository.findByName(RoleConstant.ADMIN)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "ADMIN role not found"
                                )
                        );


        User admin = new User();

        admin.setFullName("Administrator");

        admin.setEmail(adminEmail);

        admin.setPassword(
                passwordEncoder.encode("123456")
        );

        admin.setRole(adminRole);


        userRepository.save(admin);


        System.out.println(
                "Default admin created: admin@gmail.com / 123456"
        );
    }
}