# 02:14 — Đêm Không Dứt (Three.js + Vite)

Trò chơi kinh dị tâm lý góc nhìn thứ nhất (First-Person Psychological Horror) được tái cấu trúc hoàn chỉnh sang kiến trúc mô-đun hiện đại bằng **Three.js (ESM) + Vite**, xoay quanh vòng lặp thời gian lúc **02:14 sáng ngày 14 tháng 11**.

---

## 🏗️ Kiến trúc mã nguồn Modular (Three.js + Vite)

Toàn bộ dự án đã được phân rã từ tệp đơn khối lớn thành các mô-đun chuyên biệt, sạch sẽ, tuân thủ nguyên tắc Single Responsibility Principle (SRP) và tách biệt logic độc lập:

```text
dem-khong-dut/
├── index.html                   # HTML entry point, HUD, modal & giao diện overlay
├── package.json                 # Cấu hình dự án (Three.js ^0.160.0 & Vite ^5.4.0)
├── vite.config.js               # Cấu hình Vite & tách Rollup chunk cho Three.js
├── src/
│   ├── main.js                  # Điểm khởi chạy chính & vòng lặp render tối ưu
│   ├── audio.js                 # Bộ máy âm thanh không gian Web Audio API
│   ├── style.css                # Toàn bộ CSS phong cách phim kinh dị cổ điển
│   ├── config/
│   │   ├── settings.js          # Quản lý cài đặt đồ họa, FPS & lưu trữ LocalStorage
│   │   ├── storyData.js         # Dữ liệu cốt truyện 5 vòng lặp, lựa chọn đạo đức & hội thoại
│   │   └── heldPaperContent.js  # Nội dung các mẩu thư, hóa đơn, nhật ký trên giấy
│   ├── world/
│   │   ├── textures.js          # Bộ tạo vân bề mặt PBR Canvas (sàn gỗ, tường, gương, mưa)
│   │   ├── materials.js         # Khởi tạo vật liệu MeshStandardMaterial & Shader
│   │   ├── house.js             # Dựng kiến trúc nhà 3D (phòng ngủ, khách, bếp, tắm, hẻm)
│   │   ├── doors.js             # Hệ thống cửa bản lề vật lý và va chạm hộp (AABB)
│   │   ├── puzzles.js           # Câu đố (chìa khóa đồng, cầu dao điện, ngăn kéo, nến)
│   │   └── entity.js            # Mô hình thực thể Bóng Đen (Shadow Presence)
│   ├── player/
│   │   ├── controls.js          # Lắng nghe phím bấm, tính toán va chạm & di chuyển mượt
│   │   ├── match.js             # Cơ chế đánh que diêm, bấc cháy & nguồn sáng bập bùng
│   │   ├── heldPaper.js         # Cơ chế cầm tài liệu 3D trước mắt để đọc
│   │   └── hplPhysics.js        # Cơ chế vật lý kéo/đẩy xúc giác kiểu Amnesia/Penumbra
│   ├── game/
│   │   ├── state.js             # Khởi tạo trạng thái trò chơi trung tâm (State Store)
│   │   ├── horrorDirector.js    # Đạo diễn kinh dị tâm lý, âm thanh định hướng & áp lực sợ hãi
│   │   ├── loopManager.js       # Quản lý chuyển giao giữa các vòng lặp thời gian
│   │   └── endings.js           # Kịch bản 3 kết thúc, màn hạ màn & cắt cảnh tin nhắn thoại
│   └── ui/
│       ├── hud.js               # Cập nhật HUD với bộ đệm (DOM Cache) chống lag khung hình
│       ├── subtitles.js         # Hệ thống phụ đề & giọng đọc tiếng Việt Web Speech Synthesis
│       ├── journal.js           # Sổ tay hành trình & dòng thời gian lựa chọn
│       ├── keypad.js            # Bảng nhập mật mã 4 số mở két hồ sơ
│       └── settingsMenu.js      # Bảng menu tùy chỉnh đồ họa & đo FPS trực tiếp
```

---

## 🎮 Cơ chế & Tính năng gameplay

1. **Khởi đầu điện ảnh (Cinematic Awakening)**: Mở đầu nền đen chữ trắng, hiệu ứng chớp mắt mờ sương và 3 giai đoạn thức giấc trên giường (nằm -> ngồi dậy -> đứng xuống sàn).
2. **5 Vòng lặp thời gian tâm lý (Psychological Time Loops)**: Tìm các điểm dị thường (đồng hồ chạy ngược, vết cào trên tường, bóng người ngoài cửa sổ, hoa cúc trắng, vũng nước mưa...).
3. **Vật lý xúc giác HPL (Tactile Physics)**: Giữ chuột trái kéo mở từng cánh cửa gỗ, kéo ngăn kéo bàn làm việc, gạt cần cầu dao điện, cầm chai lọ ném để đánh lạc hướng Bóng Đen.
4. **Hệ thống ánh sáng & que diêm**: Quẹt diêm [F] soi đường trong bóng tối, thắp các ngọn nến rải rác để xua tan cảm giác hoảng loạn (Panic Attack).
5. **Âm thanh không gian & Giọng đọc**:
   - Âm thanh 3D Binaural Stereo định hướng tiếng thì thầm, gõ cửa, tiếng cáo đêm và tiếng bước chân trên trần nhà.
   - Hỗ trợ giọng đọc AI tiếng Việt tự nhiên qua Web Speech API.
6. **3 Kết thúc trọn vẹn**:
   - **Kết thúc Thật (Bình Minh 15/11)**: Đối diện với sự thật, nghe hết tin nhắn thoại lúc 02:09 và bước ra con hẻm bình minh ngập nắng.
   - **Kết thúc Thường (Sáng Sớm Lạnh Lẽo)**: Mở được cửa nhưng chưa thấu hiểu trọn vẹn ký ức.
   - **Kết thúc Xấu (Mắc Kẹt Lúc 02:14)**: Bị Bóng Đen bắt kịp hoặc tiếp tục trốn chạy, đưa người chơi về lại giường lúc 02:14.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Cài đặt thư viện:
```bash
npm install
```

### Chạy máy chủ phát triển (Development):
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại `http://localhost:5173`.

### Đóng gói bản Production (Build):
```bash
npm run build
```
Bản dựng tối ưu được xuất ra thư mục `dist/` với Three.js được tách thành vendor chunk riêng biệt giúp tải trang siêu nhanh và lưu cache hiệu quả.

### Chạy thử bản Production (Preview):
```bash
npm run preview
```

---

## ⌨️ Bảng điều khiển phím tắt

| Phím / Thao tác | Chức năng |
|---|---|
| `W`, `A`, `S`, `D` / Mũi tên | Di chuyển nhân vật |
| `Shift` (giữ) | Chạy nhanh (tiêu hao diêm nhanh hơn) |
| Chuột / Di ngón tay | Xoay góc nhìn (hỗ trợ Pointer Lock) |
| `Chuột trái` (giữ + kéo) | Kéo đẩy cửa, ngăn kéo bàn, cần cầu dao |
| `Chuột phải` / `G` | Ném đồ vật đang cầm để đánh lạc hướng |
| `E` | Tương tác nhanh / Đóng mở cửa / Xem manh mối |
| `F` | Quẹt / Thổi tắt que diêm |
| `J` | Mở / Đóng sổ tay ký ức |
| `O` / `Esc` | Mở / Đóng bảng Cài đặt đồ họa |
| `1`, `2` | Đưa ra lựa chọn đạo đức khi đứng trước cửa |
