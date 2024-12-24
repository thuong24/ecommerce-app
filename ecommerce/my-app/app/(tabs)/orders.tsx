import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView, RefreshControl
} from 'react-native';
import { Colors } from '@/constants/Colors';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useColorScheme, ColorSchemeName } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useUser } from '../(auth)/UserContext';

type Order = {
  id: number;
  status: string;
  totalAmount: string;
  orderDate: string;
  updatedAt: string;
};
type OrderItem = {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    selectedColor?: string; // Nếu màu có thể không tồn tại
  };
  
  export default function OrderScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [refreshing, setRefreshing] = useState(false); // Set initial state to false
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme() ?? 'light'; // Default to light mode
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const { userInfo } = useUser(); // Assuming userInfo is managed in a hook
  
    // Fetch orders from API
    const fetchOrders = async () => {
      setOrders([]); // Reset orders when fetching
      if (!userInfo || !userInfo.id) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy thông tin người dùng',
          position: 'top',
          visibilityTime: 1000,
        });
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(`http://172.20.10.4:8080/api/orders/user/${userInfo.id}`);
        if (response.data.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'Thông báo',
            text2: 'Bạn chưa có đơn hàng nào',
            position: 'top',
            visibilityTime: 1000,
          });
        } else {
          // Sort orders by updatedAt
          const sortedOrders = response.data.sort(
            (a: Order, b: Order) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setOrders(sortedOrders); // Update orders state
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Chưa có đơn hàng',
          text2: 'Không thể tải danh sách đơn hàng',
          position: 'top',
          visibilityTime: 1000,
        });
      } finally {
        setLoading(false);
      }
    };
  
    // Reset data and fetch new orders when screen is focused
    useFocusEffect(
      useCallback(() => {
        setOrders([]); // Reset orders
        setLoading(true); // Show loading indicator
        fetchOrders(); // Fetch orders
      }, [userInfo]) // Depend on userInfo so it fetches when userInfo changes
    );
  
    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    };
  
    // Handle order press
    const handleOrderPress = (orderId: number) => {
      Toast.show({
        type: 'info',
        text1: 'Thông tin đơn hàng',
        text2: `Mở chi tiết đơn hàng #${orderId}`,
        position: 'top',
      });
    };
  
    // Handle delete order
    const handleDeleteOrder = async (orderId: number, orderStatus: string) => {
      if (orderStatus !== 'PENDING_CONFIRMATION') {
        Toast.show({
          type: 'info',
          text1: 'Không thể huỷ',
          text2: 'Chỉ có thể huỷ đơn hàng đang chờ xác nhận',
          position: 'top',
        });
        return; // Exit if status is not valid
      }
  
      try {
        const response = await axios.delete(`http://172.20.10.4:8080/api/orders/delete/${orderId}`);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: `Đã huỷ đơn hàng #${orderId}`,
          position: 'top',
        });
  
        // Update the list after deletion
        setOrders(orders.filter((order) => order.id !== orderId));
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể xóa đơn hàng',
          position: 'top',
        });
      }
    };
  
    // Show order details
    const handleShowDetails = async (orderId: number) => {
      try {
        const response = await axios.get(`http://172.20.10.4:8080/api/orders/${orderId}`);
        setSelectedOrderItems(response.data.orderItems);
        setModalVisible(true);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải chi tiết đơn hàng',
          position: 'top',
        });
      }
    };
  
    const renderOrderItem = ({ item }: { item: Order }) => (
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.cardContent}>
          <Text style={styles.orderStatus}>Trạng thái:{' '}
            <Text
              style={[
                styles.statusText,
                item.status === 'PENDING_CONFIRMATION' && { color: '#FFA500' },
                item.status === 'PREPARING' && { color: '#007BFF' },
                item.status === 'ORDER_SUCCESS' && { color: '#28A745' },
                item.status === 'SHIPPING' && { color: '#17A2B8' },
                item.status === 'DELIVERED_SUCCESSFULLY' && { color: '#6C757D' },
                item.status === 'DELIVERY_FAILED' && { color: '#DC3545' },
              ]}
            >
              {item.status === 'PENDING_CONFIRMATION' && 'Đang chờ xác nhận'}
              {item.status === 'PREPARING' && 'Đang chuẩn bị hàng'}
              {item.status === 'ORDER_SUCCESS' && 'Lên đơn hàng thành công'}
              {item.status === 'SHIPPING' && 'Đang vận chuyển'}
              {item.status === 'DELIVERED_SUCCESSFULLY' && 'Giao hàng thành công'}
              {item.status === 'DELIVERY_FAILED' && 'Giao hàng thất bại'}
            </Text>
          </Text>
  
          <Text style={styles.orderAmount}>Tổng tiền: {parseInt(item.totalAmount).toLocaleString("vi-VN")} VND</Text>
          <Text style={styles.orderDate}>Ngày đặt: {formatDate(item.orderDate)}</Text>
  
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteOrder(item.id, item.status)}
            >
              <Text style={styles.deleteButtonText}>Hủy</Text>
            </TouchableOpacity>
  
            {/* Detail Button */}
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => handleShowDetails(item.id)}
            >
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      );
    }
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 123, 255, 0.15)', paddingHorizontal: 10 }}>
        <Text style={styles.headerText}>Danh sách đơn hàng của bạn</Text>
        {orders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.orderAmount}>Bạn chưa có đơn hàng nào.</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 50 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await fetchOrders(); // Tải lại danh sách đơn hàng
                  setRefreshing(false);
                }}
                colors={['#007BFF']}
                tintColor="#007BFF"
              />
            }
          />
        )}
  
        {/* Modal Chi tiết đơn hàng */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Chi tiết đơn hàng</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
              {selectedOrderItems.map((item) => (
                // Kết hợp productId và selectedColor để tạo key duy nhất
                <View key={`${item.productId}-${item.selectedColor}`} style={styles.itemCard}>
                  <Text>Tên sản phẩm: {item.productName}</Text>
                  <Text>Giá: {item.price.toLocaleString('vi-VN')} VND</Text>
                  <Text>Số lượng: {item.quantity}</Text>
                  {item.selectedColor && <Text>Màu: {item.selectedColor}</Text>}
                </View>
              ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
    marginHorizontal: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    justifyContent: 'space-between',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  orderStatus: {
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  orderAmount: {
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
  orderDate: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row', // Hiển thị các nút theo hàng ngang
    justifyContent: 'space-between', // Căn đều các nút trong hàng
    marginTop: 10,
  },
  detailButton: {
    flex: 1, // Chia đều không gian với deleteButton
    marginLeft: 5, // Tạo khoảng cách với deleteButton
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1, // Chia đều không gian với detailButton
    marginRight: 5, // Tạo khoảng cách với detailButton
    backgroundColor: '#ff4d4f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: 70,
    marginBottom: 82,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  itemCard: {
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }, 
});
