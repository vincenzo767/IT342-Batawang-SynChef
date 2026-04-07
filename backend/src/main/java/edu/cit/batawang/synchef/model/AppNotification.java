package edu.cit.batawang.synchef.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_notifications",
    indexes = {
        @Index(name = "idx_notifications_recipient_created", columnList = "recipient_user_id,created_at"),
        @Index(name = "idx_notifications_recipient_read", columnList = "recipient_user_id,is_read")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientId;

    @Column(name = "recipient_id")
    private Long recipientLegacyId;

    @Column(name = "sender_user_id")
    private Long senderId;

    @Column(name = "sender_id")
    private Long senderLegacyId;

    @Column(name = "sender_name", length = 120)
    private String senderName;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 600)
    private String message;

    @Column(name = "reference_recipe_id")
    private Long referenceRecipeId;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    void syncLegacyColumns() {
        if (recipientId == null && recipientLegacyId != null) {
            recipientId = recipientLegacyId;
        }
        if (recipientLegacyId == null && recipientId != null) {
            recipientLegacyId = recipientId;
        }

        if (senderId == null && senderLegacyId != null) {
            senderId = senderLegacyId;
        }
        if (senderLegacyId == null && senderId != null) {
            senderLegacyId = senderId;
        }
    }
}
