package com.example.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private Long userId;
        private Long productId;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String orderStatus;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer stock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        private Long orderId;
        private BigDecimal amount;
    }

    @Data
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
