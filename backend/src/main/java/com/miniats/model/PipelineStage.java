package com.miniats.model;

/**
 * Represents the Kanban-style hiring pipeline stages for an Application.
 * Order here defines the natural left-to-right order on the Kanban board.
 */
public enum PipelineStage {
    SOURCED,
    SCREENED,
    INTERVIEW,
    OFFER,
    HIRED,
    REJECTED
}
