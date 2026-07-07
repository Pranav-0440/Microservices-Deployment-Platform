package com.example.order.service;

import com.example.order.client.PaymentClient;
import com.example.order.client.ProductClient;
import com.example.order.dto.OrderDto.*;
import com.example.order.event.OrderPlacedEvent;
import com.example.order.model.Order;
import com.example.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final PaymentClient paymentClient;
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;

    private static final String KAFKA_TOPIC = "order-placed-topic";

    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        log.info("Processing order for user {} and product {}", userId, request.getProductId());

        ProductResponse product = productClient.getProductById(request.getProductId());
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock for product id: " + request.getProductId());
        }

        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = Order.builder()
                .userId(userId)
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .totalPrice(totalPrice)
                .orderStatus("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        orderRepository.save(order);

        try {
            productClient.reduceStock(request.getProductId(), request.getQuantity());

            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .orderId(order.getId())
                    .amount(totalPrice)
                    .build();

            PaymentResponse paymentResponse = paymentClient.charge(paymentRequest);

            if ("SUCCESS".equalsIgnoreCase(paymentResponse.getPaymentStatus())) {
                order.setOrderStatus("PAID");
                log.info("Payment successful for order {}", order.getId());

                OrderPlacedEvent event = OrderPlacedEvent.builder()
                        .orderId(order.getId())
                        .userId(order.getUserId())
                        .productId(order.getProductId())
                        .quantity(order.getQuantity())
                        .totalPrice(order.getTotalPrice())
                        .build();

                kafkaTemplate.send(KAFKA_TOPIC, event);
                log.info("OrderPlacedEvent published to Kafka topic {} for order {}", KAFKA_TOPIC, order.getId());

            } else {
                order.setOrderStatus("PAYMENT_FAILED");
                log.warn("Payment failed for order {}", order.getId());
            }

        } catch (Exception e) {
            order.setOrderStatus("FAILED");
            log.error("Failed to process order {}: {}", order.getId(), e.getMessage());
            throw new RuntimeException("Order processing failed: " + e.getMessage());
        }

        orderRepository.save(order);
        return mapToResponse(order);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .productId(order.getProductId())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
