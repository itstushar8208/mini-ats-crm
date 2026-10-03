package com.miniats.dto;

import com.miniats.model.PipelineStage;
import jakarta.validation.constraints.NotNull;

/** Request body used to move a Kanban card (Application) to a new stage. */
public class StageUpdateRequest {

    @NotNull
    private PipelineStage stage;

    public PipelineStage getStage() {
        return stage;
    }

    public void setStage(PipelineStage stage) {
        this.stage = stage;
    }
}
