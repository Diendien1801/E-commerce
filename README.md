--------------------------------- Quy tắc commit ----------------------------
Tuân theo chuẩn commit rõ ràng:

| Prefix      | Ý nghĩa                                      	   |
|-------------|----------------------------------------------	   |
| `ADD:`      | Thêm mới file, tính năng                     	   |
| `UPDATE:`   | Cập nhật logic, dữ liệu hoặc cấu trúc        	   |
| `FIX:`      | Sửa lỗi                                            |
| `REMOVE:`   | Xoá file hoặc đoạn code không cần thiết            |
| `STYLE:`    | Format code, chỉnh sửa style không ảnh hưởng logic |
| `REFACTOR:` | Cải tiến cấu trúc code, không thay đổi hành vi     |
| `DOC:`      | Cập nhật tài liệu, comment                         |

**Ví dụ:**
```bash
git commit -m "ADD: user model and registration controller"
git commit -m "STYLE: format server.js with Prettie
