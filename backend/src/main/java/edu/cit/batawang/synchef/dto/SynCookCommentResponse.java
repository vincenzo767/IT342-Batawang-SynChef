package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SynCookCommentResponse {
    private Long id;
    private Long authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}
