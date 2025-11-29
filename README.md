# Quy ước Coding cho Kotlin SDK

*(Đã gộp thêm mục 6 & 7 vào Checklist như yêu cầu)*

---

## 1. Ưu tiên An Toàn (Safety First)

### 1.1 Cấm tuyệt đối toán tử `!!`

(… nội dung giữ nguyên …)

### 1.2 Xử lý null rõ ràng tại các boundary

(… nội dung giữ nguyên …)

---

## 2. Kotlin Idiomatic – tránh thói quen TypeScript

(… nội dung giữ nguyên …)

---

## 3. Quy ước về Hiệu Năng (Performance)

(… nội dung giữ nguyên …)

---

## 4. Lưu ý riêng cho Kotlin Multiplatform (KMP)

(… nội dung giữ nguyên …)

---

## 5. Coroutines & Dispatchers

(… nội dung giữ nguyên …)

---

## 6. Quản lý Lỗi (Error Handling)

### 6.1 Ưu tiên Result<T> hoặc Sealed Class

**Bad** – throw exception giống TS (không an toàn trong KMP):

```kotlin
fun connectVci(): Boolean {
    if (!bluetoothAdapter.isEnabled) {
        throw Exception("Bluetooth is off")
    }
    return true
}
```

**Good** – dùng Result:

```kotlin
fun connectVci(): Result<Unit> {
    if (!bluetoothAdapter.isEnabled) {
        return Result.failure(BluetoothDisabledException())
    }
    return Result.success(Unit)
}
```

### 6.2 Dùng Sealed Class cho trạng thái phức tạp

```kotlin
sealed class ConnectionState {
    object Idle : ConnectionState()
    object Connecting : ConnectionState()
    data class Connected(val deviceName: String) : ConnectionState()
    data class Error(val reason: String) : ConnectionState()
}
```

Caller buộc phải xử lý đầy đủ qua `when`.

---

## 7. Xử lý Bitwise & Byte (Đặc thù OBD2/VCI)

### 7.1 Byte là signed trong Kotlin (-128..127)

Luôn mask khi convert sang Int:

```kotlin
val b: Byte = 0xFF.toByte()
val lenBad = b.toInt()        // -1 (sai)
val lenGood = b.toInt() and 0xFF  // 255 (đúng)
```

### 7.2 Bảng quy đổi thao tác bitwise (TS vs Kotlin)

| Tác vụ         | TypeScript | Kotlin     | Ghi chú                     |
| -------------- | ---------- | ---------- | --------------------------- |
| AND            | `a & b`    | `a and b`  | Mask bit                    |
| OR             | `a \| b`   | `a or b`   | Gộp bit                     |
| NOT            | `~a`       | `a.inv()`  | Đảo bit                     |
| Shift Left     | `a << 2`   | `a shl 2`  |                             |
| Unsigned Shift | `a >>> 2`  | `a ushr 2` | Quan trọng khi parse binary |

---

## 8. Checklist Tổng Hợp (Có thêm mục 6 & 7)

### **1. Safety**

* [ ] Không dùng `!!` trong toàn bộ SDK.
* [ ] Mọi nullable được xử lý bằng `?.`, `?:`, hoặc validate tại boundary.

### **2. Kotlin Idiomatic**

* [ ] Ưu tiên `val`; chỉ dùng `var` khi buộc phải mutable.
* [ ] Model chứa dữ liệu dùng `data class` immutable.
* [ ] Hàm đơn giản dùng expression body.

### **3. Performance**

* [ ] Pipeline lớn dùng `Sequence`.
* [ ] Dữ liệu nhị phân dùng `ByteArray`/`IntArray` thay vì List boxed.

### **4. KMP**

* [ ] API surface tối giản; chỉ public những gì cần.
* [ ] Implementation để `internal`.
* [ ] IO/Async đều expose dạng `suspend`.

### **5. Coroutines & Dispatchers**

* [ ] `Main` cho UI, `IO` cho IO-bound, `Default` cho CPU-bound.
* [ ] Không dùng `Thread.sleep()` → `delay()`.
* [ ] Không dùng `GlobalScope`, luôn gắn lifecycle rõ ràng.

### **6. Error Handling**

* [ ] Không throw exception qua public API trừ trường hợp rất đặc biệt.
* [ ] Dùng `Result<T>` cho lỗi có thể dự đoán.
* [ ] Dùng sealed class cho state phức tạp.

### **7. Bitwise & Byte (OBD2/VCI)**

* [ ] Luôn mask byte: `b.toInt() and 0xFF`.
* [ ] Dùng các toán tử Kotlin: `and`, `or`, `inv`, `shl`, `ushr`.

---

Nếu bạn muốn tôi format lại file theo chuẩn internal của team (đánh số lại, gộp mục, tối ưu wording), chỉ cần nói "refactor lại bản md cho tối ưu".
