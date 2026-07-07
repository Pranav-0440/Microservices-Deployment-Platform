package com.example.payment.dto;

import lombok.*;
import java.math.BigDecimal;

public class PaymentDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        private Long orderId;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private Long id;
        private Long orderId;
        private BigDecimal amount;
        private String paymentStatus;
        private String transactionId;
    }
}
