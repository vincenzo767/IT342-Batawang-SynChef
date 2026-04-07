package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {

    @Query("""
        select n from AppNotification n
        where coalesce(n.recipientId, n.recipientLegacyId) = :recipientId
        order by n.createdAt desc
    """)
    List<AppNotification> findByRecipientIdOrderByCreatedAtDesc(@Param("recipientId") Long recipientId);

    @Query("""
        select n from AppNotification n
        where coalesce(n.recipientId, n.recipientLegacyId) = :recipientId and n.isRead = false
        order by n.createdAt desc
    """)
    List<AppNotification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(@Param("recipientId") Long recipientId);

    @Query("""
        select count(n) from AppNotification n
        where coalesce(n.recipientId, n.recipientLegacyId) = :recipientId and n.isRead = false
    """)
    long countByRecipientIdAndIsReadFalse(@Param("recipientId") Long recipientId);

    @Query("""
        select n from AppNotification n
        where n.id = :id and coalesce(n.recipientId, n.recipientLegacyId) = :recipientId
    """)
    Optional<AppNotification> findByIdAndRecipientId(@Param("id") Long id, @Param("recipientId") Long recipientId);

    @Query("""
        select count(n) from AppNotification n
        where coalesce(n.recipientId, n.recipientLegacyId) = :recipientId and n.type = :type
    """)
    long countByRecipientIdAndType(@Param("recipientId") Long recipientId, @Param("type") String type);
}
