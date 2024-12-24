import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image, TouchableOpacity, Modal, TextInput, ScrollView, Switch } from 'react-native';
import axios from 'axios';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import RNPickerSelect from "react-native-picker-select";

// Định nghĩa kiểu dữ liệu cho Product
interface Product {
  id: number;
  name: string;
  screen: string;
  display: string;
  price: string;
  salePrice: string;
  description: string;
  stock: string;
  totalStock: string;
  screenTechnology: string;
  screenResolution: string;
  mainCamera: string;
  frontCamera: string;
  chipset: string;
  ram: string;
  internalMemory: string;
  operatingSystem: string;
  battery: string;
  weight: string;
  colors: string[];
  imagePaths: any[];
  quantity?: number;
  category: Category; // Danh mục sản phẩm
  brand: Brand; // Thương hiệu sản phẩm
}
interface IProductForm {
  id: string;
  name: string;
  screen: string;
  display: string;
  price: string;
  salePrice?: string;
  totalStock: string;
  stock: string;
  description: string;
  screenTechnology: string;
  screenResolution: string;
  mainCamera: string;
  frontCamera: string;
  chipset: string;
  ram: string;
  internalMemory: string;
  operatingSystem: string;
  battery: string;
  weight: string;
  colors?: (string | undefined)[]; // Mảng các màu
  selectedImages?: ImagePicker.ImagePickerAsset[];
  categoryId: string;
  brandId: string;
}
interface Category {
  id: number;
  name: string;
  image: string;
  brands?: Brand[];
}
interface Brand {
  id: number;
  name: string;
  image: string;
}

const ProductDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [updatedProduct, setUpdatedProduct] = useState<Product | null>(null);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<IProductForm>();
  const [colors, setColors] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<IProductForm>>({});

  const onSubmit = async (data: IProductForm) => {
    if (updatedProduct) {
      if (selectedImages.length === 0) {
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: 'Vui lòng chọn ít nhất một hình ảnh!',
              position: 'top',
              visibilityTime: 1000,
            });
            return;
          }
    const formData = new FormData();

    // Append dữ liệu sản phẩm
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof IProductForm];
      if (value !== undefined && value !== null) {
        // Chuyển đổi giá trị sang chuỗi nếu cần thiết
        if (typeof value === "number" || Array.isArray(value)) {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value as string);
        }
      }
    });

    if (colors.length > 0) {
      colors.forEach((color) => {
        formData.append('colors', color);
      });
    } else {
      formData.append('colors', '');
    }
    if (newProduct.categoryId) {
      formData.append('categoryId', newProduct.categoryId);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn danh mục!',
        position: 'top',
        visibilityTime: 1000,
      });
      return;
    }
    if (newProduct.brandId) {
      formData.append('brandId', newProduct.brandId);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn nhà cung cấp!',
        position: 'top',
        visibilityTime: 1000,
      });
      return;
    }

    // Append hình ảnh
    selectedImages.forEach((image, index) => {
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('files', {
        uri: image.uri,
        name: `image_${index}.${fileType}`,
        type: `image/${fileType}`,
      } as any); // Thêm `as any` để bỏ qua lỗi TypeScript
    });

    try {
      const response = await axios.put(`http://172.20.10.4:8080/api/product/${updatedProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Sản phẩm đã được sửa!',
        position: 'top',
        visibilityTime: 1000,
      });
      getProducts();
      // console.log('Sản phẩm đã được sửa:', response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Xin lỗi',
        text2: 'Lỗi khi sửa sản phẩm!',
        position: 'top',
        visibilityTime: 1000,
      });
      // console.error('Lỗi khi sửa sản phẩm:', error);
    }
    setIsModalVisible(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setSelectedImages((prev) => [...prev, ...result.assets]);
    }
  };
 
    // Lấy danh sách sản phẩm từ API khi component được mount
    const getProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://172.20.10.4:8080/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    getProducts();
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://172.20.10.4:8080/api/categories"
      );

      setCategories(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Xin lỗi',
        text2: 'Lỗi khi lấy danh sách category!',
        position: 'top',
        visibilityTime: 1000,
      });
      // console.error("Lỗi khi lấy danh sách category", error);
    }
  };
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>Tên: {item.name}</Text>
      <Text style={styles.productPrice}>
      <Text style={styles.salePrice}>Giá sản phẩm: {parseInt(item.price).toLocaleString("vi-VN")} VND</Text>
      </Text>
      <Text style={styles.productPrice}>
      <Text style={styles.salePrice}>Giá khuyến mãi: {parseInt(item.salePrice).toLocaleString("vi-VN")} VND</Text>
      </Text>
      <Text style={styles.productStock}>Số lượng trong kho: {item.totalStock}</Text>
      <Text style={styles.productStock}>Số lượng còn lại: {item.stock}</Text>
      <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteProduct(item.id)}
      >
        <Text style={styles.deleteButtonText}>Xoá</Text>
      </TouchableOpacity>
  
      {/* Nút Chi tiết */}
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => handleEditProduct(item.id)}
      >
        <Text style={styles.detailButtonText}>Sửa</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
  const handleEditProduct = (productId: string | number) => {
    const product = products.find((item) => item.id === Number(productId));
  
    if (product) {
      setSelectedProduct(product);
      setUpdatedProduct({ ...product });
      setColors([]); // Reset lại màu sắc đã chọn
      setSelectedImages([]); // Reset lại hình ảnh đã chọn
      setIsModalVisible(true);
      reset({ // Đặt lại form với dữ liệu của sản phẩm
        name: product.name || "",
        screen: product.screen || "",
        display: product.display || "",
        price: product.price || "",
        salePrice: product.salePrice || "", // Nếu có
        totalStock: product.totalStock || "",
        stock: product.stock || "",
        description: product.description || "",
        screenTechnology: product.screenTechnology || "",
        screenResolution: product.screenResolution || "",
        mainCamera: product.mainCamera || "",
        frontCamera: product.frontCamera || "",
        chipset: product.chipset || "",
        ram: product.ram || "",
        internalMemory: product.internalMemory || "",
        operatingSystem: product.operatingSystem || "",
        battery: product.battery || "",
        weight: product.weight || "",
        colors: updatedProduct?.colors || [], // Reset lại màu sắc
        selectedImages: [], // Reset lại hình ảnh
        categoryId: product.category.id.toString(),
        brandId: product.brand.id.toString(),
      });
    }
  };
  const handleCancel = () => {
    // Reset form khi bấm Hủy
    reset();
    setIsModalVisible(false); // Đóng modal
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await axios.delete(`http://172.20.10.4:8080/api/product/${id}`);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã xoá sản phẩm!',
        position: 'top',
        visibilityTime: 1000,
      });
      getProducts();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Xin lỗi',
        text2: 'Lỗi khi xoá sản phẩm!',
        position: 'top',
        visibilityTime: 1000,
      });
      // console.error("Lỗi khi xóa brand", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Link href="/(dashboard)/Home">
          <Text style={styles.headerText}>
            <Text style={{ fontSize: 20 }}>{"⟨ "}</Text> Quay lại
          </Text>
        </Link>
      </View>
      <Text style={styles.header}>Quản lý sản phẩm</Text>
      <View style={styles.headerContainert}>
      <Link href="/(dashboard)/ProductUpload">
          <Text style={styles.headerTex}>
            <Text style={{ fontSize: 20 }}></Text> Thêm sản phẩm
          </Text>
        </Link>
        </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false} 
      />
      {isModalVisible && selectedProduct && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chỉnh sửa sản phẩm</Text>
              
              <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
              <RNPickerSelect
              onValueChange={(value) => {
                const selectedCategory = categories.find(
                  (category) => category.id.toString() === value
                );
                if (selectedCategory) {
                  setFilteredBrands(selectedCategory.brands || []); // Cập nhật danh sách brands
                } else {
                  setFilteredBrands([]); // Không có danh mục nào được chọn
                }
                setNewProduct((prev) => ({ ...prev, categoryId: value }));
              }}
              items={categories.map((category) => ({
                label: category.name,
                value: category.id.toString(),
              }))}
              placeholder={{
                label: categories.find((cat) => cat.id.toString() === selectedProduct?.category?.id?.toString())?.name || "Chọn danh mục",
              }}
              style={{
                inputAndroid: {
                  textAlign: 'left', // Căn giữa chữ trong khung
                  height: 40,
                  backgroundColor: '#007BFF', // Nền xanh
                  color: '#fff', // Chữ màu trắng
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                },
                inputIOS: {
                  textAlign: 'left', // Căn giữa chữ trong khung
                  height: 40,
                  backgroundColor: '#007BFF', // Nền xanh
                  color: '#fff', // Chữ màu trắng
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                },
                iconContainer: {
                  top: 12, // Vị trí icon dropdown
                  right: 12,
                },
              }}
              Icon={() => {
                return (
                  <Text style={{ color: '#FFFF33', fontSize: 16 }}> Cập nhật ▼</Text> // Icon mũi tên trắng
                );
              }}
            />
            <RNPickerSelect
              onValueChange={(value) =>
                setNewProduct((prev) => ({ ...prev, brandId: value }))
              }
              items={filteredBrands.map((brand) => ({
                label: brand.name,
                value: brand.id.toString(),
              }))}
              placeholder={{ label: "Chọn nhà cung cấp" }}
              style={{
                inputAndroid: {
                  textAlign: 'left', // Căn giữa chữ trong khung
                  height: 40,
                  backgroundColor: '#007BFF', // Nền xanh
                  color: '#fff', // Chữ màu trắng
                  paddingVertical: 10,
                  paddingHorizontal: 20, marginTop: 10
                },
                inputIOS: {
                  textAlign: 'left', // Căn giữa chữ trong khung
                  height: 40,
                  backgroundColor: '#007BFF', // Nền xanh
                  color: '#fff', // Chữ màu trắng
                  paddingVertical: 10,
                  paddingHorizontal: 20, marginTop: 10
                },
                iconContainer: {
                  top: 22, // Vị trí icon dropdown
                  right: 12,
                },
              }}
              Icon={() => {
                return (
                  <Text style={{ color: '#FFFF33', fontSize: 16 }}> Cập nhật ▼</Text> // Icon mũi tên trắng
                );
              }}
            />
              <Controller
            name="name"
            control={control}
            defaultValue={updatedProduct?.name || ""} // Sử dụng tên sản phẩm hiện tại nếu có, nếu không thì là chuỗi rỗng
            rules={{ required: 'Tên sản phẩm là bắt buộc' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 15 }}>
                <TextInput
                  placeholder="Tên sản phẩm"
                  onBlur={onBlur}
                  onChangeText={onChange} // Đơn giản là gọi onChange với giá trị nhập vào
                  value={value || ""} // Đảm bảo giá trị luôn là chuỗi, không phải undefined
                  style={{ borderWidth: 1, padding: 10, marginTop: 10 }}
                />
                {/* Hiển thị lỗi nếu có */}
                {errors.name && <Text style={{ color: 'red' }}>{errors.name.message}</Text>}
              </View>
            )}
          />

      <Controller
        name="screen"
        defaultValue="Chưa cập nhật"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Kích Màn hình (inch)"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />
          </View>
        )}
      />
      <Controller
        name="display"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Loại màn hình (lcd & oled)"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />
          </View>
        )}
      />
      <Controller
        name="price"
        control={control}
        defaultValue="0"
        rules={{ required: 'Giá sản phẩm là bắt buộc' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Giá sản phẩm"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "0" ? "" : String(value)}
        style={{ borderWidth: 1, padding: 10 }}
            />
{errors.price && <Text style={{ color: 'red' }}>{errors.price.message}</Text>}
          </View>
        )}
      />
      <Controller
        name="salePrice"
        control={control}
        defaultValue="0"
        rules={{ required: 'Giá sale là bắt buộc' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Giá sale sản phẩm"
               keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "0" ? "" : String(value)}
        style={{ borderWidth: 1, padding: 10 }}
            />
{errors.salePrice && <Text style={{ color: 'red' }}>{errors.salePrice.message}</Text>}
          </View>
        )}
      />
      <Controller
        name="totalStock"
        control={control}
        defaultValue="0"
        rules={{ required: 'Số lượng sản phẩm trong kho là bắt buộc' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Số lượng sản phẩm trong kho"
               keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "0" ? "" : String(value)}
        style={{ borderWidth: 1, padding: 10 }}
            />
            {errors.totalStock && <Text style={{ color: 'red' }}>{errors.totalStock.message}</Text>}
          </View>
        )}
      />
      <Controller
        name="stock"
        control={control}
        defaultValue="0"
        rules={{ required: 'Số lượng sản phẩm bán là bắt buộc' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Số lượng sản phẩm bán "
               keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "0" ? "" : String(value)}
        style={{ borderWidth: 1, padding: 10 }}
            />
                        {errors.stock && <Text style={{ color: 'red' }}>{errors.stock.message}</Text>}

          </View>
        )}
      />
      <Controller
        name="description"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Mô tả sản phẩm "
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="screenTechnology"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Tính năng màn hình"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="screenResolution"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Độ phân giải màn hình"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="mainCamera"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Camera chính"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="frontCamera"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Camera trước"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="chipset"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Chip set"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="ram"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="RAM"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="internalMemory"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Bộ nhớ trong"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="operatingSystem"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Hệ điều hành"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="battery"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Dung lượng pin"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <Controller
        name="weight"
        control={control}
        defaultValue="Chưa cập nhật"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Trọng lượng"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text === "" ? "" : text)}
        value={value === "Chưa cập nhật" ? "" : value}
        style={{ borderWidth: 1, padding: 10 }}
            />

          </View>
        )}
      />
      <View style={styles.checkbox}>
      <Text style={styles.titlecheckbox}>Chọn màu cho sản phẩm</Text>
      {['black', 'white', 'red', 'grey', 'purple', 'yellow', 'gray', 'pink', 'green', 'blue', 'silver', 'brown'].map((color) => (
        <View key={color} style={styles.checkboxContainer}>
          <Switch
            value={colors.includes(color)}
            onValueChange={() =>
              setColors((prev) =>
                prev.includes(color)
                  ? prev.filter((c) => c !== color)
                  : [...prev, color]
              )
            }
            trackColor={{ true: '#007AFF', false: '#ccc'  }}
            thumbColor={colors.includes(color) ? '#007AFF' : color}
          />
          <Text style={styles.colorLabel}>{color}</Text>
        </View>
      ))}
    </View>


      {/* Các trường khác tương tự */}
    
      <Text style={styles.titleimage}>Đã chọn {selectedImages.length} hình ảnh | vui lòng chọn hình ảnh theo thứ tự màu đã chọn</Text>


    </ScrollView>
              
              <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={pickImage}>
                  <Text style={styles.saveButtonText}>Chọn hình ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)}>
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },headerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },headerContainert: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#333' },headerTex: { fontSize: 16, fontWeight: 'bold', color: 'blue' },buttonContainer: {
    flexDirection: 'row', // Hiển thị các nút theo hàng ngang
    justifyContent: 'space-between', // Căn đều các nút trong hàng
    marginTop: 10,
  },deleteButton: {
    flex: 1, // Chia đều không gian với detailButton
    marginRight: 5, // Tạo khoảng cách với detailButton
    backgroundColor: '#ff4d4f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },detailButton: {
    flex: 1, // Chia đều không gian với deleteButton
    marginLeft: 5, // Tạo khoảng cách với deleteButton
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }, deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },creatButton: {  marginTop: -20},
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', marginTop: 10
  },
  productList: {
    paddingBottom: 50, // Đảm bảo có khoảng trống ở cuối màn hình
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
    borderRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    marginVertical: 8,
  },
  salePrice: {
    color: 'red',
    fontWeight: 'bold',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  productStock: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginTop: 80
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  }, modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 120
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 6,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }, checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  colorLabel: {
    fontSize: 16,
    marginLeft: 8,
  },actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },checkbox: {
    padding: 16,
    backgroundColor: '#fff',
  }, actionText: { color: '#fff', fontWeight: 'bold' },titleimage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 12,
  },updateButton: { backgroundColor: '#4caf50', padding: 8, borderRadius: 5 },
  titlecheckbox: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default ProductDashboard;
