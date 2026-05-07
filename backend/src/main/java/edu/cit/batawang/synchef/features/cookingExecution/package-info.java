/**
 * Cooking Execution Feature Slice
 *
 * This package contains all real-time cooking functionality including:
 * - Parallel timer orchestration
 * - Step-by-step cooking progress tracking
 * - Real-time WebSocket communication
 * - Ingredient scaling and measurement conversions
 * - Cooking session management
 *
 * Structure:
 * - controller: REST and WebSocket endpoints for cooking
 * - service: Timer orchestration and recipe scaling logic
 * - repository: Database access for cooking sessions
 * - entity: CookingSession JPA entity
 * - dto: Data transfer objects for cooking operations
 * - test: Unit and integration tests for cooking module
 */
package edu.cit.batawang.synchef.features.cookingExecution;
