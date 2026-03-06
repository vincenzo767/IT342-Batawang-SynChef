package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScaledStepDTO {
    private Long stepId;
    private Integer orderIndex;
    private String instruction;
    private Boolean hasTimer;
    private Integer originalTimerSeconds;
    private Integer scaledTimerSeconds;
    private String timerLabel;
    private Boolean isParallel;
    private Integer parallelGroup;
    private String tips;
}
