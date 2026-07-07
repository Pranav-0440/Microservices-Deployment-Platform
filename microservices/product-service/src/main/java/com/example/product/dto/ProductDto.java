package com.example.product.dto;

import lombok.*;
import java.math.BigDecimal;

public class ProductDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
    }
}
