package com.example.order.client;

import com.example.order.dto.OrderDto.PaymentRequest;
import com.example.order.dto.OrderDto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "PAYMENT-SERVICE", path = "/api/payments")
public interface PaymentClient {

    @PostMapping("/charge")
    PaymentResponse charge(@RequestBody PaymentRequest request);
}
