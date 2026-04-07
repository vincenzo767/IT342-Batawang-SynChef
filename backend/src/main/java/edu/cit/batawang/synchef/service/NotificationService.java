package edu.cit.batawang.synchef.service;

import edu.cit.batawang.synchef.dto.NotificationResponse;
import edu.cit.batawang.synchef.model.AppNotification;
import edu.cit.batawang.synchef.model.SynCookRecipe;
import edu.cit.batawang.synchef.model.User;
import edu.cit.batawang.synchef.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final String TYPE_SYSTEM_WELCOME = "SYSTEM_WELCOME";
    private static final String TYPE_COMMENT = "SYNCOOK_COMMENT";

    private final AppNotificationRepository notificationRepository;

    @Transactional
    public void createWelcomeNotifications(User user) {
        long existing = notificationRepository.countByRecipientIdAndType(user.getId(), TYPE_SYSTEM_WELCOME);
        if (existing >= 2) {
            return;
        }

        saveSystemNotification(
            user.getId(),
            "Chef!",
            "Welcome to SynChef, " + safeName(user) + "! Thank you for joining the world's largest online cooking community."
        );

        saveSystemNotification(
            user.getId(),
            "Chef!",
            "Start exploring global flavors and connect with fellow chefs around the world."
        );
    }

    @Transactional
    public void createCommentNotification(SynCookRecipe recipe, User actor, String commentContent) {
        if (recipe.getOwnerId() == null || actor.getId() == null || recipe.getOwnerId().equals(actor.getId())) {
            return;
        }

        String actorName = safeName(actor);
        String message = actorName + " commented on your dish \"" + recipe.getTitle() + "\": " + preview(commentContent);

        AppNotification notification = new AppNotification();
        notification.setRecipientId(recipe.getOwnerId());
        notification.setSenderId(actor.getId());
        notification.setSenderName(actorName);
        notification.setType(TYPE_COMMENT);
        notification.setTitle("Chef!");
        notification.setMessage(message);
        notification.setReferenceRecipeId(recipe.getId());
        notification.setIsRead(false);
        notification.setIsSystem(false);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long userId, boolean unreadOnly) {
        List<AppNotification> notifications = unreadOnly
            ? notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId)
            : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

        return notifications.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long userId, Long notificationId) {
        AppNotification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification = notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    @Transactional
    public long markAllAsRead(Long userId) {
        List<AppNotification> unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        if (unread.isEmpty()) {
            return 0;
        }
        unread.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    private void saveSystemNotification(Long recipientId, String title, String message) {
        AppNotification notification = new AppNotification();
        notification.setRecipientId(recipientId);
        notification.setType(TYPE_SYSTEM_WELCOME);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setIsSystem(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(AppNotification entity) {
        return new NotificationResponse(
            entity.getId(),
            entity.getType(),
            entity.getTitle(),
            entity.getMessage(),
            entity.getSenderId(),
            entity.getSenderName(),
            entity.getReferenceRecipeId(),
            entity.getIsRead(),
            entity.getIsSystem(),
            entity.getCreatedAt()
        );
    }

    private String preview(String content) {
        if (content == null) {
            return "";
        }
        String normalized = content.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= 80) {
            return normalized;
        }
        return normalized.substring(0, 77) + "...";
    }

    private String safeName(User user) {
        if (user == null) {
            return "Chef";
        }
        if (user.getFullName() != null && !user.getFullName().trim().isEmpty()) {
            return user.getFullName().trim();
        }
        if (user.getUsername() != null && !user.getUsername().trim().isEmpty()) {
            return user.getUsername().trim();
        }
        return "Chef";
    }
}
