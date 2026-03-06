package edu.cit.batawang.synchef.config;

import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Spring AI integration
 */
@Configuration
public class AIConfiguration {
    
    @Value("${spring.ai.openai.api-key}")
    private String apiKey;
    
    @Bean
    public ChatClient chatClient() {
        OpenAiApi openAiApi = new OpenAiApi(apiKey);
        return new OpenAiChatClient(openAiApi);
    }
}
