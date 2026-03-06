package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for timer orchestration with parallel execution support
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimerOrchestrationDTO {
    private Long recipeId;
    private String recipeName;
    private List<TimerSequenceDTO> timerSequence;
    private Integer totalCookingTime;
    private String orchestrationStrategy; // SEQUENTIAL, PARALLEL, OPTIMIZED
}
