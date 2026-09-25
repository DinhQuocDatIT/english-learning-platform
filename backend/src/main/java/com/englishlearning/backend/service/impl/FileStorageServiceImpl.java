package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path topicUploadPath;
    private final Path lessonUploadPath;
    private final Path avatarUploadPath;

    public FileStorageServiceImpl(
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.topicUploadPath = Paths.get(uploadDir, "topics").toAbsolutePath().normalize();
        this.lessonUploadPath = Paths.get(uploadDir, "listening-lessons").toAbsolutePath().normalize();
        this.avatarUploadPath = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();

        try {
            Files.createDirectories(topicUploadPath);
            Files.createDirectories(lessonUploadPath);
            Files.createDirectories(avatarUploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload", e);
        }
    }

    @Override
    public String storeTopicImage(MultipartFile file) {
        return storeImage(file, topicUploadPath, "/uploads/topics/", "ảnh topic");
    }

    @Override
    public String storeLessonImage(MultipartFile file) {
        return storeImage(file, lessonUploadPath, "/uploads/listening-lessons/", "ảnh bài nghe");
    }

    @Override
    public String storeAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Validate size (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BusinessException("Ảnh đại diện không được vượt quá 2MB");
        }

        // Validate format
        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new BusinessException("Ảnh đại diện phải có định dạng JPG, PNG hoặc WEBP");
        }

        return storeImage(file, avatarUploadPath, "/uploads/avatars/", "ảnh đại diện");
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        // Không xóa ảnh default
        if (fileUrl.equals(User.DEFAULT_AVATAR_URL)) return;

        // Chỉ xử lý URL nội bộ
        if (!fileUrl.startsWith("/uploads/")) {
            log.warn("Bỏ qua xóa file external URL: {}", fileUrl);
            return;
        }

        try {
            String relativePath = fileUrl.replaceFirst("^/", "");
            Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("✅ Đã xóa file: {}", filePath);
            } else {
                log.warn("⚠️ File không tồn tại: {}", filePath);
            }
        } catch (IOException e) {
            log.error("❌ Lỗi xóa file: {}", fileUrl, e);
        }
    }

    private String storeImage(MultipartFile file, Path uploadPath, String urlPrefix, String label) {
        if (file == null || file.isEmpty()) return null;

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("File upload phải là hình ảnh");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";

        int lastDot = originalFilename.lastIndexOf(".");
        if (lastDot >= 0) {
            extension = originalFilename.substring(lastDot);
        }

        String fileName = UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), targetPath);
            return urlPrefix + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu " + label, e);
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg")
                || contentType.equals("image/jpg")
                || contentType.equals("image/png")
                || contentType.equals("image/webp");
    }
}