package com.example.payment.service;

import com.example.payment.dto.PaymentDto.*;
import com.example.payment.model.Payment;
import com.example.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentResponse processPayment(PaymentRequest request) {
        String status = "SUCCESS";
        if (request.getAmount().doubleValue() <= 0) {
            status = "FAILED";
        }

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .paymentStatus(status)
                .transactionId(UUID.randomUUID().toString())
                .build();

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .build();
    }
}
