package edu.cit.batawang.synchef.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for real-time timer updates
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class TimerWebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/timer/start")
    @SendTo("/topic/timer-updates")
    public TimerEvent handleTimerStart(TimerStartMessage message) {
        log.info("Timer started for step: {} by session: {}", message.getStepId(), message.getSessionId());
        
        TimerEvent event = new TimerEvent();
        event.setType("START");
        event.setSessionId(message.getSessionId());
        event.setStepId(message.getStepId());
        event.setDurationSeconds(message.getDurationSeconds());
        event.setTimestamp(System.currentTimeMillis());
        
        return event;
    }
    
    @MessageMapping("/timer/pause")
    @SendTo("/topic/timer-updates")
    public TimerEvent handleTimerPause(TimerControlMessage message) {
        log.info("Timer paused for step: {} by session: {}", message.getStepId(), message.getSessionId());
        
        TimerEvent event = new TimerEvent();
        event.setType("PAUSE");
        event.setSessionId(message.getSessionId());
        event.setStepId(message.getStepId());
        event.setTimestamp(System.currentTimeMillis());
        
        return event;
    }
    
    @MessageMapping("/timer/complete")
    @SendTo("/topic/timer-updates")
    public TimerEvent handleTimerComplete(TimerControlMessage message) {
        log.info("Timer completed for step: {} by session: {}", message.getStepId(), message.getSessionId());
        
        TimerEvent event = new TimerEvent();
        event.setType("COMPLETE");
        event.setSessionId(message.getSessionId());
        event.setStepId(message.getStepId());
        event.setTimestamp(System.currentTimeMillis());
        
        return event;
    }
    
    @MessageMapping("/timer/sync")
    @SendTo("/topic/timer-updates")
    public TimerEvent handleTimerSync(TimerSyncMessage message) {
        log.info("Timer sync for session: {} with {} active timers", 
                 message.getSessionId(), message.getActiveTimers().size());
        
        TimerEvent event = new TimerEvent();
        event.setType("SYNC");
        event.setSessionId(message.getSessionId());
        event.setTimestamp(System.currentTimeMillis());
        event.setData(message.getActiveTimers());
        
        return event;
    }
    
    @Data
    static class TimerStartMessage {
        private String sessionId;
        private Long stepId;
        private Integer durationSeconds;
        private String timerLabel;
    }
    
    @Data
    static class TimerControlMessage {
        private String sessionId;
        private Long stepId;
    }
    
    @Data
    static class TimerSyncMessage {
        private String sessionId;
        private java.util.List<ActiveTimer> activeTimers;
    }
    
    @Data
    static class ActiveTimer {
        private Long stepId;
        private Integer remainingSeconds;
        private String state; // RUNNING, PAUSED
    }
    
    @Data
    static class TimerEvent {
        private String type;
        private String sessionId;
        private Long stepId;
        private Integer durationSeconds;
        private Long timestamp;
        private Object data;
    }
}
