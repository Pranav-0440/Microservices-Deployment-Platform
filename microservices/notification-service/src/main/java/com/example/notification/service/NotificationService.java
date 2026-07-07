package com.example.notification.service;

import com.example.notification.event.OrderPlacedEvent;
import com.example.notification.model.NotificationLog;
import com.example.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;

    @KafkaListener(topics = "order-placed-topic", groupId = "notification-group")
    public void consumeOrderPlacedEvent(OrderPlacedEvent event) {
        log.info("Received OrderPlacedEvent from Kafka: {}", event);

        String message = String.format("Dear User %d, your order %d for product %d (Qty: %d) totaling $%s has been successfully placed and paid!",
                event.getUserId(), event.getOrderId(), event.getProductId(), event.getQuantity(), event.getTotalPrice().toString());

        NotificationLog logEntry = NotificationLog.builder()
                .orderId(event.getOrderId())
                .userId(event.getUserId())
                .message(message)
                .sentAt(LocalDateTime.now())
                .build();

        notificationLogRepository.save(logEntry);
        log.info("Notification successfully logged and sent for order {}", event.getOrderId());
    }

    public List<NotificationLog> getNotificationsByUserId(Long userId) {
        return notificationLogRepository.findByUserId(userId);
    }
}
