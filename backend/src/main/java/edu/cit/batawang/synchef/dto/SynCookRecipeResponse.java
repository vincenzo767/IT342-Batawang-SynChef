package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SynCookRecipeResponse {
    private Long id;
    private String title;
    private String country;
    private List<String> ingredients;
    private List<String> procedures;
    private String imageUrl;
    private String privacy;
    private Long ownerId;
    private String ownerName;
    private boolean canEdit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long commentCount;
    private List<SynCookCommentResponse> comments;
}
