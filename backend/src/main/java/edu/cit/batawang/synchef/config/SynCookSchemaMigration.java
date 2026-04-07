package edu.cit.batawang.synchef.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SynCookSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureSynCookImageColumnType() {
        // Fix existing databases created with image_url varchar(1500).
        jdbcTemplate.execute("ALTER TABLE IF EXISTS syncook_recipes ALTER COLUMN image_url TYPE TEXT");

        // Keep notification schema compatible across older/newer column naming.
        jdbcTemplate.execute("""
            UPDATE user_notifications
            SET recipient_id = COALESCE(recipient_id, recipient_user_id),
                recipient_user_id = COALESCE(recipient_user_id, recipient_id),
                sender_id = COALESCE(sender_id, sender_user_id),
                sender_user_id = COALESCE(sender_user_id, sender_id)
            """);
    }
}
