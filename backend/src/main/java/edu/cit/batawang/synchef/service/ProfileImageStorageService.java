package edu.cit.batawang.synchef.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Set;

@Service
public class ProfileImageStorageService {

    private static final long MAX_IMAGE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path profileImageDirectory;

    public ProfileImageStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.profileImageDirectory = Paths.get(uploadDir, "profile-images").toAbsolutePath().normalize();
    }

    public String store(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image type. Use JPEG, PNG, WEBP, or GIF.");
        }

        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Image is too large. Maximum allowed size is 5MB.");
        }

        try {
            Files.createDirectories(profileImageDirectory);
            String extension = extensionFor(contentType);
            String filename = "user-" + userId + "-" + Instant.now().toEpochMilli() + extension;
            Path target = profileImageDirectory.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/profile-images/" + filename;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store profile image", e);
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".img";
        };
    }
}