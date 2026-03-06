package edu.cit.batawang.synchef.service;

import edu.cit.batawang.synchef.dto.TimerOrchestrationDTO;
import edu.cit.batawang.synchef.dto.TimerSequenceDTO;
import edu.cit.batawang.synchef.model.Recipe;
import edu.cit.batawang.synchef.model.Step;
import edu.cit.batawang.synchef.repository.RecipeRepository;
import edu.cit.batawang.synchef.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for intelligent timer orchestration with parallel execution
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TimerOrchestrationService {
    
    private final RecipeRepository recipeRepository;
    private final StepRepository stepRepository;
    
    @Transactional(readOnly = true)
    public TimerOrchestrationDTO orchestrateTimers(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + recipeId));
        
        List<Step> timerSteps = stepRepository.findTimerStepsByRecipeId(recipeId);
        
        if (timerSteps.isEmpty()) {
            log.info("No timer steps found for recipe: {}", recipe.getName());
            return createEmptyOrchestration(recipe);
        }
        
        log.info("Orchestrating {} timer steps for recipe: {}", timerSteps.size(), recipe.getName());
        
        // Group steps by parallel capability
        Map<Integer, List<Step>> parallelGroups = timerSteps.stream()
            .filter(s -> s.getIsParallel() != null && s.getIsParallel())
            .collect(Collectors.groupingBy(s -> s.getParallelGroup() != null ? s.getParallelGroup() : 0));
        
        // Calculate optimal start times
        List<TimerSequenceDTO> sequence = calculateOptimalSequence(timerSteps, parallelGroups);
        
        Integer totalTime = calculateTotalCookingTime(sequence);
        
        TimerOrchestrationDTO orchestration = new TimerOrchestrationDTO();
        orchestration.setRecipeId(recipeId);
        orchestration.setRecipeName(recipe.getName());
        orchestration.setTimerSequence(sequence);
        orchestration.setTotalCookingTime(totalTime);
        orchestration.setOrchestrationStrategy(parallelGroups.isEmpty() ? "SEQUENTIAL" : "PARALLEL");
        
        return orchestration;
    }
    
    private List<TimerSequenceDTO> calculateOptimalSequence(List<Step> timerSteps, 
                                                            Map<Integer, List<Step>> parallelGroups) {
        List<TimerSequenceDTO> sequence = new ArrayList<>();
        int currentTime = 0;
        Set<Integer> processedGroups = new HashSet<>();
        
        // Sort steps by order index
        List<Step> sortedSteps = timerSteps.stream()
            .sorted(Comparator.comparingInt(Step::getOrderIndex))
            .collect(Collectors.toList());
        
        for (Step step : sortedSteps) {
            TimerSequenceDTO timerSeq = new TimerSequenceDTO();
            timerSeq.setStepId(step.getId());
            timerSeq.setOrderIndex(step.getOrderIndex());
            timerSeq.setTimerLabel(step.getTimerLabel());
            timerSeq.setDurationSeconds(step.getTimerSeconds());
            timerSeq.setInstruction(step.getInstruction());
            
            // Handle parallel groups
            if (step.getIsParallel() != null && step.getIsParallel() && step.getParallelGroup() != null) {
                Integer groupId = step.getParallelGroup();
                timerSeq.setParallelGroup(groupId);
                
                if (!processedGroups.contains(groupId)) {
                    // First step in parallel group - starts now
                    timerSeq.setStartAtSecond(currentTime);
                    timerSeq.setCanStartEarly(false);
                    processedGroups.add(groupId);
                } else {
                    // Subsequent steps in same group - calculate optimal start
                    List<Step> groupSteps = parallelGroups.get(groupId);
                    int longestDuration = groupSteps.stream()
                        .mapToInt(Step::getTimerSeconds)
                        .max()
                        .orElse(0);
                    
                    // Start this timer so it finishes with the longest timer
                    int startTime = currentTime + longestDuration - step.getTimerSeconds();
                    timerSeq.setStartAtSecond(Math.max(currentTime, startTime));
                    timerSeq.setCanStartEarly(true);
                }
            } else {
                // Sequential step
                timerSeq.setStartAtSecond(currentTime);
                timerSeq.setCanStartEarly(false);
                timerSeq.setParallelGroup(null);
                currentTime += step.getTimerSeconds();
            }
            
            sequence.add(timerSeq);
        }
        
        return sequence;
    }
    
    private Integer calculateTotalCookingTime(List<TimerSequenceDTO> sequence) {
        if (sequence.isEmpty()) return 0;
        
        return sequence.stream()
            .mapToInt(s -> s.getStartAtSecond() + s.getDurationSeconds())
            .max()
            .orElse(0);
    }
    
    private TimerOrchestrationDTO createEmptyOrchestration(Recipe recipe) {
        TimerOrchestrationDTO orchestration = new TimerOrchestrationDTO();
        orchestration.setRecipeId(recipe.getId());
        orchestration.setRecipeName(recipe.getName());
        orchestration.setTimerSequence(new ArrayList<>());
        orchestration.setTotalCookingTime(0);
        orchestration.setOrchestrationStrategy("NONE");
        return orchestration;
    }
}
