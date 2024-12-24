import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ImageBackground, TouchableOpacity, Image, ScrollView, useColorScheme } from "react-native";
import { useRouter } from "expo-router"; 
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import axios from "axios"; 
import { useUser } from './UserContext';
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { ColorSchemeName, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';


export default function LoginScreen() {
  const router = useRouter();
  const { email: rawEmail, phone: rawPhone } = useLocalSearchParams();
  const initialEmail = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail || "";
  const initialPhone = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone || "";
  const [email, setEmail] = useState<string>(initialEmail);
  const [phone, setPhone] = useState<string>(initialPhone);
  const [otp, setOtp] = useState(""); 
  const [generatedOtp, setGeneratedOtp] = useState(""); 
  const [otpSent, setOtpSent] = useState(false); 
  const { setUserInfo } = useUser();
  const colorScheme: ColorSchemeName = useColorScheme() || 'light'; 

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@gmail.com+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleEmailBlur = async () => {
    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Email không hợp lệ!',
        text2: 'Định dạng example@gmail.com',
        position: 'top',
        visibilityTime: 1000,
      });
    } else {
      try {
        const response = await axios.get(`http://172.20.10.4:8080/api/users/check-email-login`, {
          params: { email },
        });
        if (response.status === 200) {
          Toast.show({
            type: 'error',
            text1: 'Xin lỗi',
            text2: 'Email này không đúng!',
            position: 'top',
            visibilityTime: 2000,
          });
        }
      } catch (error) {
        // Kiểm tra nếu `error` có `response` và trạng thái là 404
        if (axios.isAxiosError(error) && error.response?.status === 404) {
        } else {
          // Thêm xử lý lỗi chung khác nếu cần
          Toast.show({
            type: 'error',
            text1: 'Đã xảy ra lỗi!',
            text2: 'Vui lòng thử lại sau.',
            position: 'top',
            visibilityTime: 1000,
          });
        }
      }
    }
  };

  const handlePhoneBlur = async () => {
    if (!isValidPhone(phone)) {
      Toast.show({
        type: 'error',
        text1: 'Xin lỗi',
        text2: 'Số điện thoại phải có 10 chữ số!',
        position: 'top',
        visibilityTime: 1000,
      });
    } else {
      try {
        const response = await axios.get(`http://172.20.10.4:8080/api/users/check-phone-login`, {
          params: { phone },
        });
        if (response.status === 200) {
          Toast.show({
            type: 'error',
            text1: 'Xin lỗi',
            text2: 'Số điện thoại này không đúng!',
            position: 'top',
            visibilityTime: 2000,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
        }
      }
    }
  };


  const handleLogin = () => {
    if (!isValidEmail(email) || !isValidPhone(phone)) {
      return;
    }
    const fakeOtp = Math.floor(50000 + Math.random() * 900000).toString();
    setGeneratedOtp(fakeOtp);
    setOtpSent(true);
    Toast.show({
      type: 'success',
      text1: 'Mã OTP đã được gửi',
      text2: `Mã OTP của bạn là: ${fakeOtp}`,
      position: 'top',
      visibilityTime: 7000,
    });
  };
  
  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      axios
        .get(`http://172.20.10.4:8080/api/users/login?email=${email}&phone=${phone}`)
        .then((response) => {
          setUserInfo(response.data); // Chỉ cập nhật sau khi OTP khớp
          Toast.show({
            type: 'success',
            text1: 'Đăng nhập thành công',
            text2: `Chào mừng ${email}!`,
            position: 'top',
            visibilityTime: 1000,
          });
          router.push('/');
        })
        .catch((error) => {
          Toast.show({
            type: 'error',
            text1: 'Đăng nhập thất bại',
            text2: 'Email hoặc số điện thoại không chính xác!',
            position: 'top',
            visibilityTime: 1000,
          });
        });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Xin lỗi',
        text2: 'Mã OTP không chính xác!',
        position: 'top',
        visibilityTime: 1000,
      });
    }
  };

  const handleGoogleLogin = () => {
    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Tài khoản của bạn đã được đăng nhập bằng Google!',
      position: 'top',
      visibilityTime: 500,
    });
    router.push('/');
  };

  const handleFacebookLogin = () => {
    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Tài khoản của bạn đã được đăng nhập bằng Facebook!',
      position: 'top',
      visibilityTime: 500,
    });
    router.push('/');
  };

  return (
    <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="account-circle" size={100} color={Colors[colorScheme].tint} />
          </View>
          
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Đăng nhập</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: Colors[colorScheme].inputBackground, color: Colors[colorScheme].text }]}
            placeholder="Email"
            placeholderTextColor={Colors[colorScheme].placeholder}
            value={email}
            onChangeText={setEmail}
            onBlur={handleEmailBlur}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: Colors[colorScheme].inputBackground, color: Colors[colorScheme].text }]}
            placeholder="Số điện thoại"
            placeholderTextColor={Colors[colorScheme].placeholder}
            value={phone}
            onChangeText={setPhone}
            onBlur={handlePhoneBlur}
            keyboardType="phone-pad"
          />

          {otpSent && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme].inputBackground, color: Colors[colorScheme].text }]}
                placeholder="Nhập mã OTP"
                placeholderTextColor={Colors[colorScheme].icon}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
              <TouchableOpacity style={[styles.loginButton, { backgroundColor: Colors[colorScheme].buttonBackground }]} onPress={handleVerifyOtp}>
                <Text style={styles.loginButtonText}>Xác thực OTP</Text>
              </TouchableOpacity>
            </>
          )}

          {!otpSent && (
            <TouchableOpacity style={[styles.loginButton, { backgroundColor: Colors[colorScheme].buttonBackground }]} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.link, { color: Colors[colorScheme].text }]}>
            Bạn chưa có tài khoản? <Text style={{ color: Colors[colorScheme].link }} onPress={() => router.push("/register")}>
              Đăng kí
            </Text>
          </Text>

          <TouchableOpacity style={[styles.socialButton, { borderColor: Colors[colorScheme].tabIconDefault }]} onPress={handleGoogleLogin}>
            <Text style={styles.socialButtonText}>Đăng nhập bằng Google</Text>
            <Image 
              source={require("@/assets/images/google-icon.png")} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { borderColor: Colors[colorScheme].tabIconDefault }]} onPress={handleFacebookLogin}>
            <Text style={styles.socialButtonText}>Đăng nhập bằng Facebook</Text>
            <Image 
              source={require("@/assets/images/facebook-icon.png")} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: { // Thêm style cho contentContainer
    flexGrow: 1, // Để đảm bảo ScrollView có thể cuộn nếu nội dung quá lớn
    justifyContent: "center",
    paddingBottom: 100, // Khoảng cách đáy
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)", 
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  socialButtonText: {
    flex: 1,
    textAlign: "center",
    color: "#333",
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  link: {
    marginTop: 10,
    textAlign: "center",
    marginBottom: 100,
  },
  loginButton: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#1e90ff", 
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff", 
    fontWeight: "bold",
  },
});

