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
    }
}
