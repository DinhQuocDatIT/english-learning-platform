package com.englishlearning.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String storeTopicImage(MultipartFile file);
    String storeLessonImage(MultipartFile file);

    String storeAvatar(MultipartFile file);

    void deleteFile(String fileUrl);
}