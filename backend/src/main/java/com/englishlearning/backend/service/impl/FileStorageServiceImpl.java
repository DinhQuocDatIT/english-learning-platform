package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path topicUploadPath;

    public FileStorageServiceImpl(
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {

        this.topicUploadPath =
                Paths.get(uploadDir, "topics")
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(topicUploadPath);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Không thể tạo thư mục lưu ảnh topic",
                    e
            );
        }
    }

    @Override
    public String storeTopicImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new BusinessException(
                    "File upload phải là hình ảnh"
            );
        }

        String originalFilename =
                StringUtils.cleanPath(
                        file.getOriginalFilename()
                );

        String extension = "";

        int lastDot =
                originalFilename.lastIndexOf(".");

        if (lastDot >= 0) {
            extension =
                    originalFilename.substring(lastDot);
        }

        String fileName =
                UUID.randomUUID() + extension;

        Path targetPath =
                topicUploadPath.resolve(fileName);

        try {

            Files.copy(
                    file.getInputStream(),
                    targetPath
            );

            return "/uploads/topics/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Không thể lưu ảnh topic",
                    e
            );
        }
    }
}