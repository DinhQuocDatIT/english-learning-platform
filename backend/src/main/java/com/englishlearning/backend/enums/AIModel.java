package com.englishlearning.backend.enums;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public enum AIModel {

    GEMINI_2_0_FLASH("gemini-2.0-flash", "GEMINI", 0.10, 0.30),
    GEMINI_2_5_FLASH("gemini-2.5-flash", "GEMINI", 0.075, 0.225),
    GEMINI_3_5_FLASH_LITE("gemini-3.5-flash-lite", "GEMINI", 0.05, 0.15),
    GEMINI_3_5_FLASH("gemini-3.5-flash", "GEMINI", 0.10, 0.30),
    GEMINI_3_5_PRO("gemini-3.5-pro", "GEMINI", 0.25, 0.75),
    GPT_4("gpt-4", "OPENAI", 0.03, 0.06),
    GPT_4_TURBO("gpt-4-turbo", "OPENAI", 0.01, 0.03);

    private final String modelName;
    private final String provider;
    private final double inputPricePerMillion;
    private final double outputPricePerMillion;

    AIModel(String modelName, String provider, double inputPricePerMillion, double outputPricePerMillion) {
        this.modelName = modelName;
        this.provider = provider;
        this.inputPricePerMillion = inputPricePerMillion;
        this.outputPricePerMillion = outputPricePerMillion;
    }

    /**
     * Tìm model theo tên
     */
    public static AIModel fromModelName(String modelName) {
        for (AIModel model : values()) {
            if (model.getModelName().equals(modelName)) {
                return model;
            }
        }
        return null;
    }

    /**
     * Tính chi phí
     */
    public BigDecimal calculateCost(int inputTokens, int outputTokens) {
        BigDecimal inputCost = BigDecimal.valueOf(inputTokens)
                .divide(BigDecimal.valueOf(1_000_000), 10, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(inputPricePerMillion));

        BigDecimal outputCost = BigDecimal.valueOf(outputTokens)
                .divide(BigDecimal.valueOf(1_000_000), 10, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(outputPricePerMillion));

        return inputCost.add(outputCost);
    }
}