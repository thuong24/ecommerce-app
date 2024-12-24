package com.thuong.backend.service;

import com.thuong.backend.dto.OrderItemRequest;
import com.thuong.backend.dto.OrderRequest;
import com.thuong.backend.entity.Order;
import com.thuong.backend.entity.OrderItem;
import com.thuong.backend.entity.OrderStatus;
import com.thuong.backend.entity.User;
import com.thuong.backend.repository.OrderItemRepository;
import com.thuong.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    // Lấy tất cả đơn hàng
    public List<Order> getAllOrders() {
        return orderRepository.findAll();  // Lấy tất cả các đơn hàng từ database
    }

     // Lấy đơn hàng theo ID
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
               .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order createOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setUser(new User(orderRequest.getUserId())); // Sử dụng constructor User(Long id)
        order.setOrderDate(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING_CONFIRMATION);
        order.setAddress(orderRequest.getAddress());
    
        double totalAmount = orderRequest.getTotalAmount();
        order.setTotalAmount(totalAmount);
    
        Order savedOrder = orderRepository.save(order);
    
        for (OrderItemRequest item : orderRequest.getOrderItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName());
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSelectedColor(item.getSelectedColor());
            orderItemRepository.save(orderItem);
        }
    
        return savedOrder;
    }
    public Order getOrderWithItems(Long orderId) {
        return orderRepository.findOrderWithItems(orderId); // Truy vấn từ repository
    }
    public void deleteOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + orderId));
        orderRepository.delete(order); // Xóa đơn hàng
    }
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);  // Tạo phương thức trong repository để tìm đơn hàng theo userId
    }
    public Double getTotalRevenueFromSuccessfulOrders() {
        return orderRepository.calculateTotalRevenueByStatus(OrderStatus.DELIVERED_SUCCESSFULLY);
    }
    public Long getTotalOrders() {
        return orderRepository.countAllOrders();
    }

    // Lấy tổng số lượng đơn hàng với trạng thái DELIVERED_SUCCESSFULLY
    public Long getTotalSuccessfulOrders() {
        return orderRepository.countOrdersByStatus(OrderStatus.DELIVERED_SUCCESSFULLY);
    }
    public List<Order> getOrdersExcludingStatuses() {
    return orderRepository.findOrdersExcludingStatuses(
        Arrays.asList(OrderStatus.DELIVERED_SUCCESSFULLY, OrderStatus.DELIVERY_FAILED)
    );
}
}