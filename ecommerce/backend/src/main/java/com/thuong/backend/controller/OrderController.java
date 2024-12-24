package com.thuong.backend.controller;


import com.thuong.backend.dto.OrderItemResponse;
import com.thuong.backend.dto.OrderRequest;
import com.thuong.backend.dto.OrderResponse;
import com.thuong.backend.entity.Order;
import com.thuong.backend.entity.OrderStatus;
import com.thuong.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
    private OrderResponse toOrderResponse(Order order) {
    List<OrderItemResponse> items = order.getOrderItems().stream()
        .map(item -> new OrderItemResponse(
            item.getProductId(),
            item.getProductName(),
            item.getPrice(),
            item.getQuantity(),
            item.getSelectedColor()))
        .toList();

    return new OrderResponse(
        order.getId(),
        order.getOrderDate(),
        order.getTotalAmount(),
        order.getStatus().toString(),
        order.getAddress(),
        items
    );
}

    @GetMapping("/orders/{orderId}")
public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
    try {
        Order order = orderService.getOrderWithItems(orderId);
        return ResponseEntity.ok(toOrderResponse(order)); // Chuyển đổi sang DTO
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng");
    }
}

    @PutMapping("/orders/{orderId}/status")
    public Order updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        return orderService.updateOrderStatus(orderId, status);
    }

    @GetMapping("/orders/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable OrderStatus status) {
        return orderService.getOrdersByStatus(status);
    }

     @PostMapping("/orders/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order createdOrder = orderService.createOrder(orderRequest);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tạo đơn hàng");
        }
    }
    @DeleteMapping("/orders/delete/{orderId}")
public ResponseEntity<?> deleteOrderById(@PathVariable Long orderId) {
    try {
        orderService.deleteOrderById(orderId); // Gọi service để xóa
        return ResponseEntity.ok("Đã xóa đơn hàng với ID: " + orderId);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng với ID: " + orderId);
    }
}
@GetMapping("/orders/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getOrdersByUserId(userId); // Gọi service để lấy đơn hàng theo userId
            if (orders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không có đơn hàng nào cho người dùng này");
            }
            return ResponseEntity.ok(orders);  // Trả về danh sách đơn hàng
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi lấy đơn hàng");
        }
    }
    @GetMapping("/orders/revenue")
public ResponseEntity<?> getTotalRevenue() {
    try {
        Double revenue = orderService.getTotalRevenueFromSuccessfulOrders();
        if (revenue == null) {
            revenue = 0.0; // Nếu không có đơn hàng nào, trả về 0
        }
        return ResponseEntity.ok(revenue); // Trả về giá trị doanh thu dạng JSON
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tính doanh thu");
    }
}
    // Lấy tổng số lượng tất cả đơn hàng
    @GetMapping("/orders/total")
    public ResponseEntity<?> getTotalOrders() {
        try {
            Long totalOrders = orderService.getTotalOrders();
            // Nếu không có đơn hàng, trả về 0
            if (totalOrders == null || totalOrders == 0) {
                totalOrders = 0L;
            }
            return ResponseEntity.ok(totalOrders); // Trả về tổng số lượng đơn hàng dưới dạng JSON
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy tổng số lượng đơn hàng");
        }
    }

    // Lấy tổng số lượng đơn hàng với trạng thái DELIVERED_SUCCESSFULLY
    @GetMapping("/orders/total-successful")
    public ResponseEntity<?> getTotalSuccessfulOrders() {
        try {
            Long totalSuccessfulOrders = orderService.getTotalSuccessfulOrders();
            // Nếu không có đơn hàng thành công, trả về 0
            if (totalSuccessfulOrders == null || totalSuccessfulOrders == 0) {
                totalSuccessfulOrders = 0L;
            }
            return ResponseEntity.ok(totalSuccessfulOrders); // Trả về tổng số lượng đơn hàng thành công dưới dạng JSON
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy tổng số lượng đơn hàng thành công");
        }
    }
    @GetMapping("/orders/excluding-status")
public ResponseEntity<?> getOrdersExcludingStatuses() {
    try {
        List<Order> orders = orderService.getOrdersExcludingStatuses();
        if (orders.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không có đơn hàng nào phù hợp");
        }
        return ResponseEntity.ok(orders); // Trả về danh sách đơn hàng
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi lấy danh sách đơn hàng");
    }
}
}