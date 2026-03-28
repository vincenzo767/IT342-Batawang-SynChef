package edu.cit.batawang.synchef.dto;

import lombok.Data;

import java.util.List;

@Data
public class SynCookRecipeRequest {
    private String title;
    private String country;
    private List<String> ingredients;
    private List<String> procedures;
    private String imageUrl;
    private String privacy;
}
