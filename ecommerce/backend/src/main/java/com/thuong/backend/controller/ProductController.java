package com.thuong.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.thuong.backend.entity.Brand;
import com.thuong.backend.entity.Category;
import com.thuong.backend.entity.Product;
import com.thuong.backend.repository.BrandRepository;
import com.thuong.backend.repository.CategoryRepository;
import com.thuong.backend.service.FileStorageService;
import com.thuong.backend.service.ProductService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FileStorageService fileStorageService; // Sử dụng service lưu file
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BrandRepository brandRepository;

public void setProductCategory(Product product, Long categoryId) {
    Category category = categoryRepository.findById(categoryId).orElse(null);
    if (category != null) {
        product.setCategory(category);
    } else {
        // Xử lý trường hợp không tìm thấy category với ID đã cho
    }
}

    @GetMapping("/products")
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/product")
    public ResponseEntity<Product> uploadProduct(
            @RequestParam("name") String name,
            @RequestParam("screen") String screen,
            @RequestParam("display") String display,
            @RequestParam("price") double price,
            @RequestParam("salePrice") double salePrice,
            @RequestParam("totalStock") Long totalStock,
            @RequestParam("stock") Long stock,
            @RequestParam("screenTechnology") String screenTechnology,
            @RequestParam("screenResolution") String screenResolution,
            @RequestParam("mainCamera") String mainCamera,
            @RequestParam("frontCamera") String frontCamera,
            @RequestParam("chipset") String chipset,
            @RequestParam("ram") String ram,
            @RequestParam("internalMemory") String internalMemory,
            @RequestParam("operatingSystem") String operatingSystem,
            @RequestParam("battery") String battery,
            @RequestParam("weight") String weight,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,  // Thêm categoryId
            @RequestParam("brandId") Long brandId,        // Thêm brandId
            @RequestParam("colors") List<String> colors,
            @RequestParam("files") List<MultipartFile> files) {
        List<String> imagePaths = new ArrayList<>();

        for (MultipartFile file : files) {
            String imagePath = fileStorageService.saveFile(file);
            if (imagePath != null) {
                imagePaths.add(imagePath);
            }
        }

        Product product = new Product();
        product.setName(name);
        product.setScreen(screen);
        product.setDisplay(display);
        product.setPrice(price);
        product.setSalePrice(salePrice);
        product.setTotalStock(totalStock);
        product.setStock(stock);
        product.setScreenTechnology(screenTechnology);
        product.setScreenResolution(screenResolution);
        product.setMainCamera(mainCamera);
        product.setFrontCamera(frontCamera);
        product.setChipset(chipset);
        product.setRam(ram);
        product.setInternalMemory(internalMemory);
        product.setOperatingSystem(operatingSystem);
        product.setBattery(battery);
        product.setWeight(weight);
        product.setDescription(description);
        product.setColors(colors); // Lưu danh sách các màu sắc
        product.setImagePaths(imagePaths); // Lưu nhiều đường dẫn hình ảnh
        Category category = categoryRepository.findById(categoryId).orElse(null);
        Brand brand = brandRepository.findById(brandId).orElse(null);

    if (category != null && brand != null) {
        // Gán đối tượng Category và Brand vào Product
        product.setCategory(category);
        product.setBrand(brand);
    } else {
        // Xử lý nếu không tìm thấy Category hoặc Brand
        // Trả về lỗi hoặc gán giá trị mặc định
        return ResponseEntity.badRequest().build();  // Trả về lỗi nếu không tìm thấy category hoặc brand
    }
        Product savedProduct = productService.saveProduct(product);
        return ResponseEntity.ok(savedProduct);
    }
    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    Product product = productService.getProductById(id);
    if (product != null) {
        return ResponseEntity.ok(product);
    } else {
        return ResponseEntity.notFound().build(); // Trả về 404 nếu không tìm thấy sản phẩm
    }
    }
    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategoryId(@PathVariable Long categoryId) {
        List<Product> products = productService.getProductsByCategoryId(categoryId);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }
    @GetMapping("/products/brand/{brandId}")
    public ResponseEntity<List<Product>> getProductsByBrandId(@PathVariable Long brandId) {
        List<Product> products = productService.getProductsByBrandId(brandId);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }
    @PutMapping("/product/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("screen") String screen,
            @RequestParam("display") String display,
            @RequestParam("price") double price,
            @RequestParam("salePrice") double salePrice,
            @RequestParam("totalStock") Long totalStock,
            @RequestParam("stock") Long stock,
            @RequestParam("screenTechnology") String screenTechnology,
            @RequestParam("screenResolution") String screenResolution,
            @RequestParam("mainCamera") String mainCamera,
            @RequestParam("frontCamera") String frontCamera,
            @RequestParam("chipset") String chipset,
            @RequestParam("ram") String ram,
            @RequestParam("internalMemory") String internalMemory,
            @RequestParam("operatingSystem") String operatingSystem,
            @RequestParam("battery") String battery,
            @RequestParam("weight") String weight,
            @RequestParam("description") String description,
            
            @RequestParam("colors") List<String> colors,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("categoryId") Long categoryId,  // Thêm categoryId
            @RequestParam("brandId") Long brandId) {     // Thêm brandId) {
        List<String> imagePaths = new ArrayList<>();

        for (MultipartFile file : files) {
            String imagePath = fileStorageService.saveFile(file);
            if (imagePath != null) {
                imagePaths.add(imagePath);
            }
        }

        Product updatedProduct = new Product();
        updatedProduct.setName(name);
        updatedProduct.setScreen(screen);
        updatedProduct.setDisplay(display);
        updatedProduct.setPrice(price);
        updatedProduct.setSalePrice(salePrice);
        updatedProduct.setTotalStock(totalStock);
        updatedProduct.setStock(stock);
        updatedProduct.setScreenTechnology(screenTechnology);
        updatedProduct.setScreenResolution(screenResolution);
        updatedProduct.setMainCamera(mainCamera);
        updatedProduct.setFrontCamera(frontCamera);
        updatedProduct.setChipset(chipset);
        updatedProduct.setRam(ram);
        updatedProduct.setInternalMemory(internalMemory);
        updatedProduct.setOperatingSystem(operatingSystem);
        updatedProduct.setBattery(battery);
        updatedProduct.setWeight(weight);
        updatedProduct.setDescription(description);
        updatedProduct.setColors(colors);
        updatedProduct.setImagePaths(imagePaths);

        Product product = productService.updateProduct(id, updatedProduct, categoryId, brandId);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.notFound().build();  // Trả về 404 nếu không tìm thấy sản phẩm
        }
    }
    @PutMapping("/product/{id}/update-stock")
    public ResponseEntity<Product> updateProductStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
    Integer quantity = body.get("quantity");
    Product product = productService.getProductById(id);

    if (product != null) {
        if (product.getStock() >= quantity) {
            product.setStock(product.getStock() - quantity); // Giảm số lượng trong kho
            Product updatedProduct = productService.saveProduct(product);
            return ResponseEntity.ok(updatedProduct);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Nếu không đủ số lượng
        }
    } else {
        return ResponseEntity.notFound().build();
    }
}
@DeleteMapping("/product/{id}")
public ResponseEntity<Void> deleteProducts(@PathVariable Long id) {
    Product product = productService.getProductById(id);

    if (product != null) {
        productService.deleteProducts(id);  // Call the service layer to delete the product
        return ResponseEntity.noContent().build();  // Return a 204 No Content status
    } else {
        return ResponseEntity.notFound().build();  // Return 404 if the product is not found
    }
}
@GetMapping("/products/count")
public ResponseEntity<Long> getTotalProductsCount() {
    long count = productService.getTotalProductsCount();
    return ResponseEntity.ok(count);  // Trả về số lượng sản phẩm
}
}