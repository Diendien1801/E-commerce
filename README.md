# Quy ước Coding cho Kotlin SDK

Ngữ cảnh team: dự án này là một Kotlin Multiplatform (KMP) SDK, được xây dựng bởi team có background TypeScript. Tài liệu này đặt ra quy ước để code SDK **an toàn**, **idiomatic Kotlin** và **hiệu năng tốt** trên mọi target (Android, iOS, JVM, Native).


---

## 1. Ưu tiên An Toàn (Safety First)

### 1.1 Cấm tuyệt đối toán tử `!!` (non-null assertion)

**Quy tắc:** Không được dùng `!!` trong code SDK. Toán tử này biến cảnh báo null ở compile-time thành crash `NullPointerException` ở runtime, tương tự `someValue!` trong TypeScript.

Thay vào đó, hãy dùng **safe call** (`?.`) và **Elvis operator** (`?:`).

#### Ví dụ: đọc từ giá trị có thể null

```kotlin
// ❌ Bad (TypeScript style / Không an toàn)

// Kiểu suy nghĩ TypeScript: "Tôi biết chắc ở đây nó không null, tin tôi đi!"
// const name = user!.name;

fun greetUser(user: User?) {
    val name: String = user!!.name  // sẽ crash nếu user == null
    println("Hello $name")
}

// ✅ Good (Chuẩn Kotlin / An toàn)

fun greetUser(user: User?) {
    val name: String = user?.name ?: "Guest"
    println("Hello $name")
}
```

#### Ví dụ: nullable từ boundary bên ngoài

```kotlin
// ❌ Bad (TypeScript style / Không an toàn)

fun parsePort(raw: String?): Int {
    // Giống như `Number(raw)!` trong TypeScript
    return raw!!.toInt()
}

// ✅ Good (Chuẩn Kotlin / An toàn, fallback rõ ràng)

fun parsePort(raw: String?): Int {
    return raw
        ?.toIntOrNull()
        ?: DEFAULT_PORT
}
```

**Ghi chú:**
- Nếu một thứ **bắt buộc** không được null, hãy thể hiện điều đó trong **kiểu** (ví dụ: khai báo tham số là non-nullable) hoặc **validate một lần ở boundary**, rồi truyền tiếp giá trị non-nullable vào sâu bên trong.
- Khi muốn thể hiện trạng thái “thiếu dữ liệu”, ưu tiên:
  - Nullability của Kotlin (`String?`),
  - Kiểu kết quả rõ ràng (ví dụ `Result<T>`),
  - Hoặc sealed class, thay vì “tin tưởng” vào `!!`.

---

### 1.2 Xử lý null rõ ràng tại các boundary

Ở các boundary của SDK (input từ app host, API nền tảng, native interop), luôn:

- Xem dữ liệu vào là **không tin cậy**.
- Chuẩn hóa sớm thành domain model an toàn.

```kotlin
// ❌ Bad (Kiểu TypeScript: tin caller, assert sau)

data class UserProfile(
    val name: String,
    val age: Int,
)

fun buildUserProfile(rawName: String?, rawAge: String?): UserProfile {
    return UserProfile(
        name = rawName!!,
        age = rawAge!!.toInt(),
    )
}

// ✅ Good (Chuẩn hóa ngay tại boundary, không dùng !! ở sâu bên trong)

data class UserProfile(
    val name: String,
    val age: Int,
)

fun buildUserProfile(rawName: String?, rawAge: String?): UserProfile? {
    val name = rawName?.takeIf { it.isNotBlank() } ?: return null
    val age = rawAge?.toIntOrNull() ?: return null

    return UserProfile(name = name, age = age)
}
```

---

## 2. Kotlin Idiomatic – tránh thói quen TypeScript

### 2.1 Ưu tiên `val` (bất biến) hơn `var`

**Quy tắc:** Mặc định dùng `val`. Chỉ dùng `var` khi thực sự cần và có lý do rõ ràng.

**Ví dụ: Tính giá khuyến mãi**

* **❌ Sai (Dùng `var` - Dễ gây Bug):**
    ```kotlin
    class Item(var price: Int)
    
    fun applyDiscount(item: Item) {
        // Vô tình sửa luôn giá gốc của item
        item.price = item.price - 10 
    }
    // Hậu quả: Item bị giảm giá vĩnh viễn ở mọi nơi khác trong app.
    ```

* **✅ Đúng (Dùng `val` - An toàn):**
    ```kotlin
    data class Item(val price: Int)
    
    fun applyDiscount(item: Item): Item {
        // Compiler cấm sửa item.price
        // Phải tạo ra object mới
        return item.copy(price = item.price - 10)
    }
    // Kết quả: Item gốc vẫn giữ nguyên giá, không ảnh hưởng logic khác.
    ```

**Ghi chú:**
- Ở **API surface** (public / internal type của SDK), ưu tiên cấu trúc bất biến.
- Dùng `val` cho property trong data class và object config.
- Dành `var` cho:
  - biến đếm vòng lặp hoặc accumulator tạm thời,
  - state bên trong cần mutable và đã được quản lý / cô lập an toàn.

---

### 2.2 Dùng data class cho các model “chỉ chứa dữ liệu”

**Quy tắc:** Khi biểu diễn data thuần túy (DTO, request/response model, value object), hãy dùng `data class` thay vì tự override `equals`, `hashCode` hay `toString`.

```kotlin
// ❌ Bad (Mang mindset class/interface của TypeScript sang)

// TypeScript-ish:
// interface BatteryStatus { level: number; isCharging: boolean; }

class BatteryStatus(
    val level: Int,
    val isCharging: Boolean,
)

// Dễ quên hoặc implement sai equals/hashCode/toString.

// ✅ Good (Kotlin data class)

data class BatteryStatus(
    val level: Int,
    val isCharging: Boolean,
)
```

**Ghi chú:**
- Dùng `data class` cho các kiểu giá trị **bất biến**.
- Không nên dùng `data class` nếu:
  - bạn đang model entity có identity và lifecycle mutable, hoặc
  - type đó có behavior phức tạp, không chỉ là container dữ liệu.

---

### 2.3 Ưu tiên expression body cho hàm đơn giản

**Quy tắc:** Với những hàm ngắn, trả về một biểu thức, hãy dùng expression body cho gọn và rõ.

```kotlin
// ❌ Bad (Viết kiểu TypeScript, dài dòng)

// TypeScript:
// function isBatteryLow(level: number): boolean {
//   return level < 20;
// }

fun isBatteryLow(level: Int): Boolean {
    return level < 20
}

// ✅ Good (Kotlin expression body)

fun isBatteryLow(level: Int): Boolean = level < 20

// Getter property ngắn cũng nên dùng expression body

val Int.isEven: Boolean
    get() = this % 2 == 0
```

**Ghi chú:**
- Expression body giúp dễ đọc hơn với logic đơn giản.
- Với logic **nhiều bước**, giữ block body để rõ ràng:

```kotlin
fun classifyBattery(level: Int): String {
    return when {
        level < 5 -> "critical"
        level < 20 -> "low"
        else -> "normal"
    }
}
```

---

## 3. Quy ước về Hiệu Năng (Performance)

### 3.1 Dùng `Sequence` cho pipeline xử lý lớn

Với các collection lớn có nhiều bước xử lý (map/filter/flatMap), chain trực tiếp trên `List` sẽ tạo nhiều list trung gian, tốn allocation. `Sequence` xử lý lười (lazy) nên thường hiệu quả hơn.

```kotlin
// ❌ Bad (Eager, tạo nhiều collection trung gian)

fun findActiveIds(items: List<Item>): List<String> {
    return items
        .map { it.id }
        .filter { it.isNotEmpty() }
        .map { it.uppercase() }
}

// ✅ Good (Dùng Sequence cho pipeline lớn)

fun findActiveIds(items: List<Item>): List<String> {
    return items
        .asSequence()
        .map { it.id }
        .filter { it.isNotEmpty() }
        .map { it.uppercase() }
        .toList()
}
```

**Ghi chú:**
- Dùng `Sequence` khi:
  - kích thước input có thể **lớn**, và
  - có **từ 2 bước transform trở lên** (map/filter/flatMap...).
- Giữ là collection thường (`List`, `Set`...) khi:
  - tập dữ liệu **nhỏ**, hoặc
  - overhead của `Sequence` không đáng kể so với lợi ích.

---

### 3.2 Ưu tiên `IntArray` / `ByteArray` hơn List dạng boxed

Với các đoạn code hiệu năng cao, loop chặt (ví dụ: parse protocol nhị phân, build packet, tính checksum), hạn chế dùng `List<Int>` / `List<Byte>` nếu có thể. Mảng primitive tránh boxing, allocation dư thừa và tốt hơn cho native backend.

```kotlin
// ❌ Bad (Int/Byte bị boxed, tốn allocation)

fun sumBytes(values: List<Byte>): Int {
    var sum = 0
    for (b in values) {
        sum += b.toInt()
    }
    return sum
}

// ✅ Good (Dùng primitive array)

fun sumBytes(values: ByteArray): Int {
    var sum = 0
    for (b in values) {
        sum += b.toInt()
    }
    return sum
}
```

#### Ví dụ: frame / buffer protocol

```kotlin
// ❌ Bad (Mang style mảng number[] của TypeScript sang)

// TypeScript:
// function buildFrame(bytes: number[]): number[] { ... }

fun buildFrame(payload: List<Byte>): List<Byte> {
    val frame = mutableListOf<Byte>()
    frame.add(START_BYTE)
    frame.addAll(payload)
    frame.add(END_BYTE)
    return frame
}

// ✅ Good (Kotlin, dùng ByteArray primitive)

fun buildFrame(payload: ByteArray): ByteArray {
    val frame = ByteArray(payload.size + 2)
    frame[0] = START_BYTE
    payload.copyInto(destination = frame, destinationOffset = 1)
    frame[frame.size - 1] = END_BYTE
    return frame
}
```

**Ghi chú:**
- Ở public API, cần cân bằng giữa **dễ dùng** và **hiệu năng**:
  - Đối với consumer SDK, `ByteArray` / `IntArray` là kiểu chuẩn; ưu tiên dùng.
  - Nếu cần, convert nội bộ sang `List` / `Sequence`, hạn chế bắt consumer phải làm ngược lại.

---

## 4. Lưu ý riêng cho Kotlin Multiplatform (KMP)

### 4.1 Dùng `internal` cho logic nội bộ SDK

**Quy tắc:** Mặc định visibility trong shared module nên là `internal`, **không** phải `public`.

- `public` là một phần **hợp đồng API** của SDK; thay đổi sẽ gây breaking change.
- `internal` che giấu chi tiết implementation trong module, tương tự symbol không `export` trong TypeScript.

```kotlin
// ❌ Bad (Lộ implementation, mọi thứ đều public)

// TypeScript:
// export class BleCommandBuilder { ... }

class BleCommandBuilder {   // Kotlin: mặc định là public
    fun buildConnectCommand(deviceId: String): ByteArray { /* ... */ }
}

// ✅ Good (internal cho logic không phải API)

internal class BleCommandBuilder {
    fun buildConnectCommand(deviceId: String): ByteArray { /* ... */ return byteArrayOf() }
}

// Public API lộ bề mặt tối thiểu

class BleClient internal constructor(
    private val builder: BleCommandBuilder,
) {
    fun connect(deviceId: String) { /* ... */ }
}
```

**Ghi chú:**
- Chỉ dùng `public` cho:
  - type/API thật sự là hợp đồng public của SDK (`api-*` module, có document chính thức).
- Ưu tiên `internal` cho:
  - helper function,
  - mapper, parser, helper tầng data,
  - state machine nội bộ.

---

### 4.2 Dùng `suspend` cho IO và async boundary

**Quy tắc:** Mọi hàm thực hiện IO hoặc async (disk, network, Bluetooth, database, platform channel) trong shared code nên được khai báo là `suspend`. Tránh để callback/promise-style tràn trực tiếp vào public API ở KMP.

```kotlin
// ❌ Bad (Phong cách Promise/Callback của TypeScript)

// TypeScript:
// function fetchBatteryStatus(): Promise<BatteryStatus> { ... }

interface BatteryService {
    fun fetchBatteryStatus(onResult: (BatteryStatus) -> Unit,
                           onError: (Throwable) -> Unit)
}

// ✅ Good (API Kotlin dùng suspend)

interface BatteryService {
    suspend fun fetchBatteryStatus(): BatteryStatus
}

// Call site (Kotlin):
// coroutineScope.launch {
//     val status = batteryService.fetchBatteryStatus()
// }
```

#### Ví dụ: wrap callback platform vào suspend

```kotlin
// ❌ Bad (Để callback tràn vào common code)

expect class PlatformHttpClient {
    fun get(url: String,
            onSuccess: (String) -> Unit,
            onError: (Throwable) -> Unit)
}

// ✅ Good (Dùng suspend trong common, adapter callback ở platform code)

expect class PlatformHttpClient {
    suspend fun get(url: String): String
}

// Ở một platform cụ thể (ví dụ Android actual):

actual class PlatformHttpClient {
    actual suspend fun get(url: String): String =
        suspendCancellableCoroutine { cont ->
            performAsyncRequest(url,
                onSuccess = { body -> cont.resume(body) },
                onError = { error -> cont.resumeWithException(error) }
            )
        }
}
```
---
## 5. COROUTINES & DISPATCHERS (QUẢN LÝ LUỒNG)

Khác với TypeScript (Single-thread Event Loop), Kotlin là Multi-thread. Việc chọn sai luồng sẽ gây treo UI hoặc nghẽn cổ chai khi giao tiếp phần cứng.

###  Quy tắc 5.1: Chọn đúng Dispatcher
Phân biệt rõ ràng giữa việc "Chờ đợi" (IO) và "Tính toán" (CPU).

* **`Dispatchers.Main`**: Chỉ dùng cho **UI updates**. Cấm xử lý logic tại đây.
* **`Dispatchers.IO`**: Dành cho tác vụ **Input/Output** (Đọc/Ghi file, Network, Bluetooth Socket, USB). Tối ưu cho việc chờ đợi.
* **`Dispatchers.Default`**: Dành cho tác vụ **CPU Intensive** (Parse JSON lớn, tính Checksum, mã hóa/giải mã, xử lý ảnh).

**Ví dụ: Xử lý dữ liệu từ phần cứng (VCI)**

* **❌ Sai (Dùng sai luồng):**
    ```kotlin
    // Chạy việc tính toán nặng trên luồng IO
    // Gây tắc nghẽn, làm chậm các tác vụ mạng/bluetooth khác
    suspend fun processFrame(data: ByteArray) = withContext(Dispatchers.IO) {
        val protocol = parseComplexProtocol(data) // Tốn CPU
    }
    ```

* **✅ Đúng (Context Switching):**
    ```kotlin
    suspend fun processFrame(data: ByteArray) {
        // 1. Đọc dữ liệu (IO Bound) -> Dùng IO
        val rawBytes = withContext(Dispatchers.IO) {
            hardwarePort.read()
        }

        // 2. Xử lý logic (CPU Bound) -> Chuyển sang Default
        val result = withContext(Dispatchers.Default) {
            parseComplexProtocol(rawBytes) // CPU chạy tối đa hiệu suất
        }
    }
    ```

###  Quy tắc 5.2: Non-blocking (Không chặn luồng)
Tuyệt đối không dùng `Thread.sleep()` trong Coroutine. Nó sẽ "khóa chết" Thread đó, không ai khác sử dụng được.

* **❌ Sai (Blocking):**
    ```kotlin
    fun retryConnection() {
        Thread.sleep(2000) // Đóng băng Thread hiện tại trong 2s -> App bị đơ (ANR)
        connect()
    }
    ```

* **✅ Đúng (Suspending):**
    ```kotlin
    suspend fun retryConnection() {
        delay(2000) // Nhường Thread đi làm việc khác, 2s sau quay lại tiếp tục
        connect()
    }
    ```

###  Quy tắc 5.3: Structured Concurrency (Vòng đời Coroutine)
Tránh "Fire-and-forget" (Bắn xong quên). Mọi Coroutine phải gắn liền với một vòng đời (Lifecycle) cụ thể để tránh Memory Leak khi người dùng thoát màn hình.

* **❌ Sai (GlobalScope - Nguy hiểm):**
    ```kotlin
    fun uploadLog() {
        // Coroutine này sống mãi kể cả khi Activity/Screen đã đóng
        // Dễ gây crash ngầm hoặc tốn pin
        GlobalScope.launch { 
            api.upload()
        }
    }
    ```

* **✅ Đúng (Lifecycle Aware):**
    ```kotlin
    // Trong ViewModel hoặc Class quản lý Scope
    fun uploadLog() {
        // Tự động hủy (cancel) nếu ViewModel bị hủy
        viewModelScope.launch { 
            api.upload()
        }
    }
    ```

###  Bảng tóm tắt chuyển đổi (TS -> Kotlin)

| Tác vụ trong TypeScript | Tương đương trong Kotlin | Ghi chú |
| :--- | :--- | :--- |
| `setTimeout(fn, 1000)` | `delay(1000)` | Không dùng `Thread.sleep` |
| `await fetch(url)` | `withContext(Dispatchers.IO) { api.get() }` | Network/DB/File luôn dùng IO |
| `JSON.parse(hugeData)` | `withContext(Dispatchers.Default) { parse() }` | Tính toán nặng dùng Default |
| Unhandled Promise | `GlobalScope.launch` (CẤM) | Dễ gây Memory Leak |

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

## 7. Xử lý Bitwise & Byte 

### 7.1 Byte là signed trong Kotlin (-128..127)
Khác với Uint8Array trong TypeScript (0..255), kiểu Byte trong Kotlin là có dấu (Signed) (-128..127).
- **Vấn đề**: Khi một byte có giá trị lớn hơn 127 (ví dụ 0xFF), bit đầu tiên là 1. Khi convert sang Int (32-bit), máy tính sẽ tự động lấp đầy các bit còn thiếu bằng số 1 để giữ nguyên giá trị âm. Đây gọi là Sign Extension.
- **Giải pháp**: Dùng phép and 0xFF để xóa sạch các bit thừa phía trước, trả về giá trị dương đúng.
```kotlin
Input Byte (0xFF):  1111 1111             (Kotlin hiểu là -1)
                        |
[GỌI .toInt()]          v
Sign Extension:     1111 1111 ... 1111 1111 (Vẫn là -1, nhưng ở dạng 32-bit)
                        |
[MASK and 0xFF]         v
Mask (0xFF):        0000 0000 ... 1111 1111 
                        |
[KẾT QUẢ]               v
Result (255):       0000 0000 ... 1111 1111 (Đây là 255)
```
```kotlin
val b: Byte = 0xFF.toByte() // Kotlin hiểu là -1

// ❌ Bad: Sai giá trị, hỏng logic độ dài/checksum
val lenBad = b.toInt()      // Kết quả: -1

// ✅ Good: Luôn mask để lấy giá trị dương (Unsigned int)
val lenGood = b.toInt() and 0xFF // Kết quả: 255
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

### **7. Bitwise & Byte **

* [ ] Luôn mask byte: `b.toInt() and 0xFF`.
* [ ] Dùng các toán tử Kotlin: `and`, `or`, `inv`, `shl`, `ushr`.

---

Nếu bạn muốn tôi format lại file theo chuẩn internal của team (đánh số lại, gộp mục, tối ưu wording), chỉ cần nói "refactor lại bản md cho tối ưu".
