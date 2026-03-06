package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimerSequenceDTO {
    private Long stepId;
    private Integer orderIndex;
    private String timerLabel;
    private Integer durationSeconds;
    private Integer startAtSecond; // When to start this timer relative to cooking start
    private Boolean canStartEarly;
    private Integer parallelGroup;
    private String instruction;
}
