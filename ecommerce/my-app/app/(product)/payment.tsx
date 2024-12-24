import axios from 'axios';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, TextInput, SafeAreaView } from 'react-native';
import { useUser } from '../(auth)/UserContext';
import Toast from 'react-native-toast-message';
import { useSearchParams } from 'expo-router/build/hooks';

interface Product {
  id: number;
  productName: string;
  price: string;
  selectedImagePath: string;
  selectedColor: string;
  productId: number;
  quantity: number;
  promotions: string[];
}

export default function PaymentScreen() {
  const [isMoMoModalVisible, setIsMoMoModalVisible] = useState(false);
  const [isVNPAYModalVisible, setIsVNPAYModalVisible] = useState(false);
  const [isCashModalVisible, setIsCashModalVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { userInfo } = useUser();
  const searchParams = useSearchParams();
  const totalAmount = parseFloat(searchParams.get('totalAmount') || "0");

  useEffect(() => {
    if (userInfo) {
      axios.get(`http://172.20.10.4:8080/api/cart/${userInfo.id}`)
      .then((response) => {
        const productsWithDefaultPromotions = response.data.map((product: any) => ({
          ...product,
          promotions: product.promotions || [],
        }));
        setProducts(productsWithDefaultPromotions);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }, [userInfo]);

  const paymentDataMoMo = {
    service: 'Thanh toán MoMo',
    bankName: 'DH123456789',
    accountNumber: 'DCART_86871777_010',
    status: 'Bảo mật thông tin & An toàn tài sản của bạn là ưu tiên hàng đầu của MoMo'
  };

  const paymentDataVNPAY = {
    service: 'Thanh toán VNPAY',
    bankName: 'VNPAY_123456789',
    accountNumber: 'VNPAY_010',
    status: 'Chúng tôi cam kết bảo vệ thông tin cá nhân và tài sản của bạn trong suốt quá trình thanh toán VNPAY.'
  };

  const paymentDataCash = {
    service: 'Thanh toán tiền mặt',
    bankName: 'Cash_38K4DU&S',
    accountNumber: 'Thanh toán sau khi nhận hàng',
  };

  const updateProductStock = (productId: number, quantity: number) => {
    return axios.put(`http://172.20.10.4:8080/api/product/${productId}/update-stock`, {
      quantity: quantity,
    })
    // .then((response) => {
    //   console.log('Cập nhật số lượng sản phẩm thành công', response.data);
    // })
    .catch((error) => {
      console.log('Cập nhật số lượng sản phẩm thất bại', error);
    });
  };

  const handlePaymentSuccess = () => {
    // Cập nhật số lượng sản phẩm trong kho
    const updateStockPromises = products.map((product) => {
      if (product.quantity > 0) {
        return updateProductStock(product.productId, product.quantity);
      }
      return Promise.resolve();
    });
  
    // Chờ tất cả các yêu cầu cập nhật kho hoàn tất
    Promise.all(updateStockPromises)
      .then(() => {
        // Tạo đơn hàng
        const orderRequest = {
          userId: userInfo?.id, 
          address: userInfo?.address,
          totalAmount: totalAmount,// ID người dùng
          orderItems: products.map((product) => ({
            productId: product.productId,
            productName: product.productName,
            price: parseFloat(product.price),
            quantity: product.quantity,
            selectedColor: product.selectedColor,
          })),
        };
  
        // Gửi yêu cầu tạo đơn hàng tới backend
        axios.post('http://172.20.10.4:8080/api/orders/create', orderRequest,
        {timeout: 10000})
          .then(() => {
            if (!userInfo) {
              // Nếu người dùng chưa đăng nhập, dừng thực hiện
              return;
            }
            // Sau khi tạo đơn hàng thành công, xóa giỏ hàng
            axios.delete(`http://172.20.10.4:8080/api/cart/delete/${userInfo.id}`)
              .then(() => {
                Toast.show({
                  type: "success",
                  text1: "Thêm vào giỏ hàng",
                  text2: 'Thanh toán thành công! Đơn hàng đã được tạo.',
                  position: "top",
                  visibilityTime: 1000,
                });
                router.push('/');  // Chuyển hướng đến trang đơn hàng
              })
              .catch((error) => {
                console.log('Xóa giỏ hàng thất bại', error);
              });
          })
      })
      .catch((error) => {
        console.log('Có lỗi xảy ra khi cập nhật số lượng sản phẩm', error);
      });
  };
  
  const currentDate = new Date().toLocaleDateString('vi-VN');

  const renderPaymentModal = (isVisible: boolean, closeModal: () => void, paymentData: any) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
    >
       <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Chi tiết giao dịch</Text>
            <View style={styles.transactionDetail}>
              <Text style={styles.modalText}>Dịch vụ</Text>
              <Text style={styles.modalText}>{paymentData.service}</Text>
            </View>
            <View style={styles.transactionDetail}>
              <Text style={styles.modalText}>Mã đơn hàng</Text>
              <Text style={styles.modalText}>{paymentData.bankName}</Text>
            </View>
            <View style={styles.transactionDetail}>
              <Text style={styles.modalText}>Mô tả</Text>
              <Text style={styles.modalText}>{paymentData.accountNumber}</Text>
            </View>
            <View style={styles.transactionDetail}>
              <Text style={styles.modalText}>Ngày thanh toán</Text>
              <Text style={styles.modalText}>{currentDate}</Text>
            </View>
            <View style={styles.transactionDetail}>
              <Text style={styles.modalText}>Tạm tính</Text>
              <Text style={styles.modalText}>{totalAmount.toLocaleString('vi-VN')}</Text>
            </View>
            <Text style={styles.modalText}>
            </Text>
            <Text style={styles.modalText}>
            </Text>
            <Text style={styles.modalText}>
            </Text>
            <Text style={styles.modalText}>
            {paymentData.status}
            </Text>
            
            <TextInput
              style={styles.modalText1}
              placeholder="Nhập mã ưu đãi"
              value=""
            />
            <View style={styles.transactionDetail}>
              <Text style={styles.modalText}>Tổng tiền</Text>
              <Text style={styles.modalText}>{totalAmount.toLocaleString('vi-VN')}</Text>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={() => {
              handlePaymentSuccess();
              closeModal();
              alert('Thanh toán thành công!\n Cảm ơn bạn đã mua hàng');
              router.push('/');
            }}>
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
    </Modal>
  );

  return (
    <SafeAreaView  style={{ flex: 1, backgroundColor: 'rgba(0, 123, 255, 0.15)' }}>
      <View style={styles.headerContainer}>
        <Link href="/">
          <Text style={styles.headerText}>
            <Text style={{ fontSize: 20 }}>{"⟨ "}</Text> Trang chủ
          </Text>
        </Link>
      </View>
    <View style={styles.container}>
      <Text style={styles.header}>Phương thức thanh toán</Text>

      {/* Thanh toán MoMo */}
      <TouchableOpacity style={styles.paymentOption} onPress={() => setIsMoMoModalVisible(true)}>
        <Image
          source={require("@/assets/images/momo.png")} 
          style={styles.paymentLogo}
        />
        <Text style={styles.paymentText}>Cổng thanh toán MoMo</Text>
      </TouchableOpacity>

      {/* Thanh toán VNPAY */}
      <TouchableOpacity style={styles.paymentOption} onPress={() => setIsVNPAYModalVisible(true)}>
        <Image
          source={require("@/assets/images/vnpay.png")} 
          style={styles.paymentLogo}
        />
        <Text style={styles.paymentText}>Cổng thanh toán VNPAY</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.paymentOption} onPress={() => setIsCashModalVisible(true)}>
        <Image
          source={require("@/assets/images/casg.png")} 
          style={styles.paymentLogo}
        />
        <Text style={styles.paymentText}>Thanh toán bằng tiền mặt</Text>
      </TouchableOpacity>

      {/* Modal chi tiết thanh toán MoMo */}
      {renderPaymentModal(isMoMoModalVisible, () => setIsMoMoModalVisible(false), paymentDataMoMo)}

      {/* Modal chi tiết thanh toán VNPAY */}
      {renderPaymentModal(isVNPAYModalVisible, () => setIsVNPAYModalVisible(false), paymentDataVNPAY)}
      {renderPaymentModal(isCashModalVisible, () => setIsCashModalVisible(false), paymentDataCash)}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },headerContainer: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  paymentLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#e83e52',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  transactionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    width: '100%',
  },
  modalText1: {
    borderWidth: 2, 
    borderColor: '#ccc', 
    borderRadius: 4, 
    padding: 10, 
    marginBottom: 8, 
    width: '100%'
  },
});
