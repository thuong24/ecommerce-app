package com.thuong.backend.repository;

import com.thuong.backend.entity.Order;
import com.thuong.backend.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.id = :orderId")
Order findOrderWithItems(@Param("orderId") Long orderId);
List<Order> findByUserId(Long userId);
@Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    Double calculateTotalRevenueByStatus(@Param("status") OrderStatus status);
    // Đếm tổng số đơn hàng
    @Query("SELECT COUNT(o) FROM Order o")
    Long countAllOrders();

    // Đếm số đơn hàng có trạng thái DELIVERED_SUCCESSFULLY
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countOrdersByStatus(@Param("status") OrderStatus status);
    // Truy vấn để lấy các đơn hàng với trạng thái khác DELIVERED_SUCCESSFULLY và DELIVERY_FAILED
    @Query("SELECT o FROM Order o WHERE o.status NOT IN (:excludedStatuses)")
    List<Order> findOrdersExcludingStatuses(@Param("excludedStatuses") List<OrderStatus> excludedStatuses);
}
