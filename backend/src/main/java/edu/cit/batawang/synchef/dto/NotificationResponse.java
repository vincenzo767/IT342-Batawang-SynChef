package edu.cit.batawang.synchef.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String type,
    String title,
    String message,
    Long senderId,
    String senderName,
    Long referenceRecipeId,
    Boolean isRead,
    Boolean isSystem,
    LocalDateTime createdAt
) {
}
