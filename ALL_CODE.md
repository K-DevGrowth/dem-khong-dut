# TỔNG HỢP TOÀN BỘ MÃ NGUỒN DỰ ÁN ĐÊM KHÔNG DỨT

> Dự án: **02/14 — Đêm Không Dứt (Amnesia-Style Psychological Horror Game)**  
> Công nghệ: **Three.js + Vite (ESM Modules)**  
> Thời gian xuất: 20:07:22 23/11/2026

## Danh mục tập tin (32 files)

- [package.json](#package-json) (18 dòng)
- [vite.config.js](#vite-config-js) (21 dòng)
- [.gitignore](#-gitignore) (7 dòng)
- [index.html](#index-html) (343 dòng)
- [README.md](#README-md) (107 dòng)
- [src/audio.js](#src-audio-js) (1,109 dòng)
- [src/config/heldPaperContent.js](#src-config-heldPaperContent-js) (115 dòng)
- [src/config/settings.js](#src-config-settings-js) (77 dòng)
- [src/config/storyData.js](#src-config-storyData-js) (309 dòng)
- [src/game/endings.js](#src-game-endings-js) (411 dòng)
- [src/game/horrorDirector.js](#src-game-horrorDirector-js) (479 dòng)
- [src/game/loopManager.js](#src-game-loopManager-js) (510 dòng)
- [src/game/saveManager.js](#src-game-saveManager-js) (55 dòng)
- [src/game/state.js](#src-game-state-js) (50 dòng)
- [src/game/timerManager.js](#src-game-timerManager-js) (52 dòng)
- [src/main.js](#src-main-js) (2,363 dòng)
- [src/player/controls.js](#src-player-controls-js) (97 dòng)
- [src/player/heldPaper.js](#src-player-heldPaper-js) (34 dòng)
- [src/player/hplPhysics.js](#src-player-hplPhysics-js) (215 dòng)
- [src/player/match.js](#src-player-match-js) (129 dòng)
- [src/style.css](#src-style-css) (1,505 dòng)
- [src/ui/hud.js](#src-ui-hud-js) (66 dòng)
- [src/ui/journal.js](#src-ui-journal-js) (78 dòng)
- [src/ui/keypad.js](#src-ui-keypad-js) (103 dòng)
- [src/ui/settingsMenu.js](#src-ui-settingsMenu-js) (158 dòng)
- [src/ui/subtitles.js](#src-ui-subtitles-js) (128 dòng)
- [src/world/doors.js](#src-world-doors-js) (81 dòng)
- [src/world/entity.js](#src-world-entity-js) (107 dòng)
- [src/world/house.js](#src-world-house-js) (1,099 dòng)
- [src/world/materials.js](#src-world-materials-js) (143 dòng)
- [src/world/puzzles.js](#src-world-puzzles-js) (421 dòng)
- [src/world/textures.js](#src-world-textures-js) (483 dòng)

**Tổng số dòng code:** 10,873 dòng.


---

### <a id="package-json"></a> Tập tin: `package.json` (18 dòng)

```json
{
  "name": "0214-ngay-khong-chiu-qua",
  "private": true,
  "version": "1.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

---

### <a id="vite-config-js"></a> Tập tin: `vite.config.js` (21 dòng)

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});
```

---

### <a id="-gitignore"></a> Tập tin: `.gitignore` (7 dòng)

```
node_modules/
dist/
dist-ssr/
*.local
.DS_Store
Thumbs.db
```

---

### <a id="index-html"></a> Tập tin: `index.html` (343 dòng)

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>02:14 — Đêm Không Dứt</title>
  <meta name="description" content="02:14 — Đêm Không Dứt: Trò chơi kinh dị tâm lý góc nhìn thứ nhất 3D trên trình duyệt." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Lora:ital,wght@0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
</head>
<body class="pre-start">
  <div id="canvas-container"></div>
  <div id="film-grain"></div>
  <div id="fear-vignette"></div>
  <div id="danger-pulse"></div>
  <div id="panic-overlay"></div>
  <div id="light-whiteout"></div>
  <div id="blink-overlay">
    <div id="blink-clock">02:14</div>
    <div id="blink-sub">Đêm mưa · 02:14</div>
  </div>
  <div id="crosshair"></div>
  <div id="interact-prompt">Nhấn [E] tương tác</div>
  <div id="hpl-hint"></div>
  <div id="chase-banner">
    <div class="chase-main">RA KHỎI ĐÂY</div>
    <div class="chase-sub">CHẠY THẲNG RA CỬA CHÍNH</div>
  </div>

  <!-- TOP HUD (Minimal Horror Layout) -->
  <div id="hud-top">
    <div class="hud-minimal-left">
      <div class="hud-status-line">
        <span id="loop-label" class="hud-clock">Vòng 1/5 · 02:14</span>
        <span class="hud-dot">·</span>
        <span id="anomaly-pill" class="hud-anomaly"><span id="anomaly-label">Dấu vết: 0/2</span></span>
        <span class="hud-dot">·</span>
        <span class="hud-match-wrap">
          Diêm <strong id="match-count">10</strong>
          <span class="bar-track match-track"><span id="match-bar" class="bar-fill"></span></span>
        </span>
        <span id="fps-badge" class="hud-fps hidden">FPS: --</span>
        <span class="sr-only" aria-hidden="true"><span id="fear-bar"></span><span id="fear-pct">0%</span></span>
      </div>
      <div id="objective-toast" class="objective-toast">
        <span id="objective-text">Kiểm tra trong nhà &amp; tìm chìa khóa phòng làm việc</span>
      </div>
    </div>
    <div class="hud-minimal-right">
      <button id="btn-journal" class="hud-ghost-btn" type="button" title="Ghi chép (J)">Ghi chép (J)</button>
      <button id="btn-settings" class="hud-ghost-btn" type="button" title="Cài đặt (O)">Cài đặt (O)</button>
    </div>
  </div>

  <!-- FOLEY SOUND TEST DRAWER -->
  <div id="foley-panel" class="foley-panel hidden">
    <div class="foley-header">
      <span id="foley-status">Âm thanh thu âm thật (Mixkit / Wikimedia)</span>
      <button id="btn-close-foley" class="foley-close" type="button" aria-label="Đóng">✕</button>
    </div>
    <div class="foley-grid">
      <button class="foley-btn" data-sfx="door_open" type="button">Kéo cửa mở</button>
      <button class="foley-btn" data-sfx="door_close" type="button">Đóng cửa</button>
      <button class="foley-btn" data-sfx="wardrobe_open" type="button">Kéo tủ áo</button>
      <button class="foley-btn" data-sfx="wardrobe_slam" type="button">Sập tủ áo</button>
      <button class="foley-btn" data-sfx="portrait_fall" type="button">Rớt khung ảnh</button>
      <button class="foley-btn" data-sfx="wood_scratch" type="button">Tiếng cào gỗ</button>
      <button class="foley-btn" data-sfx="fox_cry" type="button">Tiếng đêm ngoài hẻm</button>
      <button class="foley-btn" data-sfx="door_knock" type="button">Gõ cửa gỗ</button>
      <button class="foley-btn" data-sfx="scare_sting" type="button">Ám ảnh / Giật mình</button>
    </div>
  </div>

  <!-- SUBTITLES -->
  <div id="subtitle-box">
    <div id="subtitle-speaker">Ý nghĩ</div>
    <div id="subtitle-text"></div>
    <div id="subtitle-continue">Nhấn [E] hoặc click để tiếp tục</div>
  </div>

  <!-- BOTTOM HUD -->
  <div id="hud-bottom">
    <div id="touch-pad">
      <div></div>
      <button class="pad-btn" data-key="KeyW" type="button" aria-label="Tiến">▲</button>
      <div></div>
      <button class="pad-btn" data-key="KeyA" type="button" aria-label="Trái">◀</button>
      <button class="pad-btn" data-key="KeyS" type="button" aria-label="Lùi">▼</button>
      <button class="pad-btn" data-key="KeyD" type="button" aria-label="Phải">▶</button>
    </div>

    <div class="controls-hint">
      <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Di chuyển ·
      Click/Kéo chuột xoay nhìn ·
      <kbd>F</kbd> Quẹt / Dập diêm ·
      <kbd>E</kbd> Tương tác ·
      
      <kbd>Shift</kbd> Chạy ·
      <kbd>O</kbd> Cài đặt
    </div>

    <div class="action-buttons">
      <button id="btn-match" class="action-btn" type="button">Quẹt / Dập diêm (F)</button>
      <button id="btn-interact" class="action-btn" type="button">Tương tác (E)</button>
    </div>
  </div>

  <!-- EYELID OVERLAY FOR WAKE-UP -->
  <div id="eye-haze"></div>
  <div id="eyelid-top"></div>
  <div id="eyelid-bottom"></div>

  <!-- MAIN TITLE SCREEN (Option A: No early spoilers) -->
  <div id="start-screen">
    <div class="title-wrap">
      <div class="title-kicker">Đêm Mưa · Phòng Ngủ</div>
      <h1 class="title-main">02:14</h1>
      <div class="title-sub">Đêm Không Dứt</div>
      <p class="title-desc">Mưa vẫn gõ đều ngoài cửa sổ. Chiếc giường bên cạnh đã lạnh, đồng hồ đầu giường cứ dừng ở 02:14 — và có tiếng gõ trầm đục vang lên sau cánh cửa chính.</p>
      <div class="start-btn-row">
        <button id="btn-continue" class="wake-btn continue-btn hidden" type="button">Tiếp tục</button>
        <button id="btn-start" class="wake-btn" type="button">Bắt đầu</button>
      </div>
      <div class="title-hint">WASD di chuyển · Chuột xoay nhìn · E tương tác · F quẹt diêm · Shift chạy · J ghi chép · O cài đặt</div>
    </div>
  </div>

  <!-- BLACK-AND-WHITE INTRO OVERLAY (Option A: Unreliable Narrator) -->
  <div id="intro-screen">
    <div class="intro-content">
      <p id="intro-line-1" class="intro-line">Tiếng mưa khuya đập đều lên khung cửa kính.</p>
      <p id="intro-line-2" class="intro-line">Alice chưa về, hay đang ở phòng bên cạnh? Ngoài cửa chính vừa vang lên ba nhịp gõ rất khẽ.</p>
      <p id="intro-line-3" class="intro-line intro-date">02:14 · Ai đó đang đứng ngoài cửa</p>
    </div>
    <button id="intro-skip" type="button">Nhấn phím bất kỳ hoặc click để tiếp tục</button>
  </div>

  <!-- MORAL CHOICE OVERLAY (Option C: 1 key decision at end of Loops 1–4) -->
  <div id="choice-screen" class="overlay-screen hidden">
    <div class="modal-card choice-card">
      <div id="choice-kicker" class="modal-kicker">Quyết định · Cuối Vòng 1</div>
      <h2 id="choice-title">Tiếng gõ sau cánh cửa</h2>
      <p id="choice-prompt" class="choice-prompt"></p>
      <div class="choice-options">
        <button id="btn-choice-a" class="choice-btn" type="button">
          <span id="choice-a-label" class="choice-label"></span>
          <span id="choice-a-sub" class="choice-sub"></span>
        </button>
        <button id="btn-choice-b" class="choice-btn" type="button">
          <span id="choice-b-label" class="choice-label"></span>
          <span id="choice-b-sub" class="choice-sub"></span>
        </button>
      </div>
    </div>
  </div>


  <!-- AUTO-PAUSE OVERLAY (Esc / Pointer Lock / Tab Switch) -->
  <div id="pause-overlay" class="overlay-screen hidden">
    <div class="modal-card pause-card">
      <div class="modal-kicker">02:14 · Đêm Không Dứt</div>
      <h2>Tạm dừng</h2>
      <p class="pause-sub">Trò chơi đã tạm dừng. Nhấn nút bên dưới để khóa chuột và tiếp tục.</p>
      <div class="pause-actions">
        <button id="btn-resume" class="primary-btn" type="button">Tiếp tục chơi</button>
        <button id="btn-pause-settings" class="secondary-btn" type="button">Cài đặt</button>
        <button id="btn-pause-title" class="secondary-btn" type="button">Về màn hình chính</button>
      </div>
    </div>
  </div>

  <!-- SETTINGS OVERLAY -->
  <div id="settings-screen" class="overlay-screen hidden">
    <div class="modal-card">
      <div class="modal-kicker">Tối ưu hiệu năng &amp; Trải nghiệm</div>
      <h2>Cài đặt trò chơi</h2>

      <!-- Chất lượng đồ họa -->
      <div class="settings-section">
        <div class="settings-label-row">
          <span class="settings-label">Chất lượng đồ họa</span>
        </div>
        <div class="seg-group seg-3" id="gfx-preset-group">
          <button type="button" class="seg-btn" data-gfx="low">Thấp</button>
          <button type="button" class="seg-btn" data-gfx="medium">Trung bình</button>
          <button type="button" class="seg-btn" data-gfx="high">Cao</button>
        </div>
        <p id="gfx-desc" class="settings-hint"></p>
      </div>

      <!-- Giới hạn FPS -->
      <div class="settings-section">
        <div class="settings-label-row">
          <span class="settings-label">Giới hạn FPS</span>
        </div>
        <div class="seg-group seg-4" id="fps-limit-group">
          <button type="button" class="seg-btn" data-fps="30">30 FPS</button>
          <button type="button" class="seg-btn" data-fps="60">60 FPS</button>
          <button type="button" class="seg-btn" data-fps="120">120 FPS</button>
          <button type="button" class="seg-btn" data-fps="0">Không giới hạn</button>
        </div>
        <p class="settings-hint">Giới hạn FPS giúp khung hình ổn định hơn, giảm nóng máy và tiết kiệm pin/GPU.</p>
      </div>

      <!-- Bộ đếm FPS & Độ mượt Camera -->
      <div class="settings-section">
        <div class="toggle-row">
          <div>
            <div class="settings-label">Hiển thị bộ đếm FPS</div>
            <div class="settings-hint" style="margin-top:2px !important;">Hiện chỉ số khung hình trực tiếp ở góc trên màn hình.</div>
          </div>
          <button type="button" id="toggle-show-fps" class="toggle-switch" aria-label="Hiển thị bộ đếm FPS"></button>
        </div>
        <div class="toggle-row">
          <div>
            <div class="settings-label">Mượt camera (Camera Smoothing)</div>
            <div class="settings-hint" style="margin-top:2px !important;">Làm êm chuyển động xoay góc nhìn, giảm cảm giác giật khi di chuột.</div>
          </div>
          <button type="button" id="toggle-cam-smooth" class="toggle-switch" aria-label="Mượt camera"></button>
        </div>
      </div>

      <!-- Độ nhạy chuột -->
      <div class="settings-section">
        <div class="settings-label-row">
          <span class="settings-label">Độ nhạy chuột / cảm ứng</span>
          <span id="sens-display" class="sens-value">1.0x</span>
        </div>
        <input id="slider-sens" class="range-slider" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
      </div>

      <!-- Âm thanh & Giọng kể -->
      <div class="settings-section">
        <div class="settings-label-row">
          <span class="settings-label">Âm thanh &amp; Giọng kể</span>
        </div>
        <div class="settings-btn-row">
          <button id="btn-mute" class="hud-btn" type="button">Âm thanh: Bật</button>
          <button id="btn-voice" class="hud-btn" type="button">Giọng kể: Tắt</button>
          <select id="voice-select" class="hud-select" title="Chọn giọng đọc tiếng Việt"></select>
        </div>
      </div>

      <!-- Tiện ích & Kiểm thử -->
      <div class="settings-section">
        <div class="settings-label-row">
          <span class="settings-label">Tiện ích &amp; Kiểm thử</span>
        </div>
        <div class="settings-btn-row">
          <button id="btn-pad-toggle" class="hud-btn" type="button">Phím ảo</button>
          <button id="btn-foley" class="hud-btn" type="button" data-dev-only="true">Thử âm thanh</button>
          <button id="btn-test-ending" class="hud-btn" type="button" data-dev-only="true">Test kết thúc</button>
        </div>
      </div>

      <div class="modal-actions">
        <button id="btn-reset-settings" class="secondary-btn" type="button">Khôi phục mặc định</button>
        <button id="btn-close-settings" class="primary-btn" type="button">Lưu &amp; Đóng</button>
      </div>
    </div>
  </div>

  <!-- 4-DIGIT KEYPAD OVERLAY (LOOP 5) -->
  <div id="keypad-screen" class="overlay-screen hidden">
    <div class="modal-card keypad-card">
      <div class="modal-kicker">Khóa mã hộp hồ sơ · Vòng 5</div>
      <h2>Nhập mật mã 4 số</h2>
      <p style="font-size:13px; margin-bottom:10px;">Bốn chữ số lặp lại trên đồng hồ đầu giường, gương phòng tắm và tờ lịch bị xé dở.</p>
      <div id="keypad-display" class="keypad-display">----</div>
      <p id="keypad-msg" class="keypad-msg">Gõ phím số hoặc bấm trực tiếp bên dưới.</p>
      <div class="keypad-grid">
        <button type="button" class="keypad-btn" data-digit="1">1</button>
        <button type="button" class="keypad-btn" data-digit="2">2</button>
        <button type="button" class="keypad-btn" data-digit="3">3</button>
        <button type="button" class="keypad-btn" data-digit="4">4</button>
        <button type="button" class="keypad-btn" data-digit="5">5</button>
        <button type="button" class="keypad-btn" data-digit="6">6</button>
        <button type="button" class="keypad-btn" data-digit="7">7</button>
        <button type="button" class="keypad-btn" data-digit="8">8</button>
        <button type="button" class="keypad-btn" data-digit="9">9</button>
        <button type="button" class="keypad-btn action" id="btn-keypad-clear">Xóa</button>
        <button type="button" class="keypad-btn" data-digit="0">0</button>
        <button type="button" class="keypad-btn action" id="btn-keypad-enter">Mở</button>
      </div>
      <button id="btn-close-keypad" class="secondary-btn" type="button" style="width:100%;">Đóng lại (Esc)</button>
    </div>
  </div>

  <!-- JOURNAL OVERLAY -->
  <div id="journal-screen" class="overlay-screen hidden">
    <div class="modal-card">
      <div class="modal-kicker">Sổ ghi chép · Mảnh ghép ký ức</div>
      <h2>Những gì chưa khớp trong căn nhà</h2>
      <div id="journal-timeline" class="timeline-strip"></div>
      <div id="journal-choices" class="journal-choices"></div>
      <div id="journal-list">
        <p>Chưa có ghi chép nào.</p>
      </div>
      <div style="margin-top: 20px;">
        <button id="btn-close-journal" class="primary-btn" type="button">Đóng lại</button>
      </div>
    </div>
  </div>

  <!-- ENDING OVERLAY -->
  <div id="ending-screen" class="overlay-screen hidden">
    <div class="the-end-wrap">
      <div id="ending-badge" class="the-end-badge">Kết thúc Thật · 1/3</div>
      <h2 id="ending-title" class="the-end-title">The End</h2>
      <div id="ending-kicker" class="the-end-date">15 tháng 11 · 05:48</div>
      <p id="ending-body" class="the-end-body"></p>
      <div id="ending-choices-summary" class="ending-choices-summary"></div>
      <div id="ending-phone" class="phone-cut">
        <div class="phone-top">
          <span id="ending-phone-time">05:48</span>
          <div class="phone-notch"></div>
          <span id="ending-phone-date">15/11</span>
        </div>
        <div class="phone-vm-row">
          <div id="ending-phone-icon" class="phone-vm-icon">✓</div>
          <div class="phone-vm-meta">
            <div id="ending-phone-title" class="phone-vm-title">Tin nhắn thoại · 02:09 · đã nghe</div>
            <div class="phone-vm-bar"><div id="ending-phone-bar" class="phone-vm-bar-fill"></div></div>
          </div>
        </div>
      </div>
      <div class="ending-switch-row">
        <button type="button" class="ending-switch-btn" data-ending="true">Xem Kết thúc Thật</button>
        <button type="button" class="ending-switch-btn" data-ending="normal">Xem Kết thúc Thường</button>
        <button type="button" class="ending-switch-btn" data-ending="bad">Xem Kết thúc Xấu</button>
      </div>
      <div class="ending-action-row">
        <button id="btn-retry-loop" class="the-end-btn retry-loop-btn hidden" type="button">Chơi lại ngay vòng này</button>
        <button id="btn-restart" class="the-end-btn" type="button">Chơi lại từ đầu</button>
      </div>
    </div>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

### <a id="README-md"></a> Tập tin: `README.md` (107 dòng)

```markdown
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
```

---

### <a id="src-audio-js"></a> Tập tin: `src/audio.js` (1,109 dòng)

```javascript
// =========================================================
// SELF-HOSTED WEB AUDIO BUFFER + PROCEDURAL HORROR ENGINE
// Loads local pre-decoded AudioBuffers from public/audio/
// (zero external CDN hotlinks) with full Web Audio procedural
// synthesis fallback when local studio files are absent.
// =========================================================

const AUDIO_BASE = `${(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './'}audio/`;

export const SFX_ASSETS = {
  doorOpen: `${AUDIO_BASE}door-open.mp3`,
  doorClose: `${AUDIO_BASE}door-close.mp3`,
  doorKnock: `${AUDIO_BASE}door-knock.mp3`,
  glassHit: `${AUDIO_BASE}glass-hit.mp3`,
  glassDebris: `${AUDIO_BASE}glass-debris.mp3`,
  horrorAmbience: `${AUDIO_BASE}horror-ambience.mp3`,
  tombAmbience: `${AUDIO_BASE}tomb-ambience.mp3`,
  scaryWoods: `${AUDIO_BASE}scary-woods.mp3`,
  scaryWind: `${AUDIO_BASE}scary-wind.mp3`,
  terrorSweep: `${AUDIO_BASE}terror-sweep.mp3`,
  horrorSweep: `${AUDIO_BASE}horror-sweep.mp3`,
  foxCry: `${AUDIO_BASE}fox-cry.ogg`
};

export class HouseAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.started = false;
    this.masterGain = null;
    this.reverbSend = null;
    this.droneGain = null;
    this.staticGain = null;
    this.whiteBuf = null;
    this.brownBuf = null;
    this.lastBeat = 0;
    this.lastTick = 0;
    this.lastRing = 0;

    // Pre-decoded Web Audio buffers & looping ambience bus
    this.bufferCache = {};
    this.bgAmbienceSrc = null;
    this.bgAmbienceGain = null;
    this.bgWindSrc = null;
    this.bgWindGain = null;
    this.ambienceMutedBySequence = false;
    this.assetsLoadedCount = 0;
    this.onAssetStatus = null;
    this.endingPlaying = false;
    this.endingLoopTimer = null;
    this.endingBus = null;
    this.rainSrc = null;
    this.rainGain = null;
    this.deadSilenceUntil = 0;
  }

  init() {
    if (this.started) {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      this._ensureAmbiencePlaying();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.started = true;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.88;
    this.masterGain.connect(this.ctx.destination);

    // Pre-generate shared noise buffers
    const sr = this.ctx.sampleRate;
    const nLen = sr * 3;
    this.whiteBuf = this.ctx.createBuffer(1, nLen, sr);
    const wd = this.whiteBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) wd[i] = Math.random() * 2 - 1;

    this.brownBuf = this.ctx.createBuffer(1, nLen, sr);
    const bd = this.brownBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nLen; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.04 * w) / 1.04;
      bd[i] = Math.max(-1, Math.min(1, last * 3.2));
    }

    // Room convolution reverb
    const irLen = Math.floor(sr * 1.35);
    const irBuf = this.ctx.createBuffer(2, irLen, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = irBuf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < irLen; i++) {
        const decay = Math.pow(1 - i / irLen, 2.7);
        const raw = (Math.random() * 2 - 1) * decay;
        lp = lp * 0.72 + raw * 0.28;
        data[i] = lp;
      }
    }
    const convolver = this.ctx.createConvolver();
    convolver.buffer = irBuf;
    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.34;
    this.reverbSend.connect(convolver);
    convolver.connect(this.masterGain);

    // Subtle sub-bass floor drone
    const osc1 = this.ctx.createOscillator();
    const flt = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();
    osc1.type = 'sine'; osc1.frequency.value = 39;
    flt.type = 'lowpass'; flt.frequency.value = 95;
    this.droneGain.gain.value = 0.08;
    osc1.connect(flt); flt.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    osc1.start();

    // TV static layer
    const src = this.ctx.createBufferSource();
    src.buffer = this.whiteBuf; src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 880; bp.Q.value = 2.4;
    this.staticGain = this.ctx.createGain();
    this.staticGain.gain.value = 0.003;
    src.connect(bp); bp.connect(this.staticGain);
    this.staticGain.connect(this.masterGain);
    src.start();

    // Ambience gain buses (routed cleanly through masterGain)
    this.bgAmbienceGain = this.ctx.createGain();
    this.bgAmbienceGain.gain.value = 0.24;
    this.bgAmbienceGain.connect(this.masterGain);

    this.bgWindGain = this.ctx.createGain();
    this.bgWindGain.gain.value = 0.10;
    this.bgWindGain.connect(this.masterGain);

    // Start procedural wind bed immediately so ambience works even without external files
    this._startProceduralWindBed();
    this._preloadAssets();
  }

  _startProceduralWindBed() {
    if (!this.ctx || !this.bgWindGain || this.bgWindSrc) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.brownBuf;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 260;
    bp.Q.value = 1.8;
    src.connect(bp);
    bp.connect(this.bgWindGain);
    src.start();
    this.bgWindSrc = src;
  }

  _startBufferLoop(key, targetGain, currentSrcProp) {
    const buf = this.bufferCache[key];
    if (!this.ctx || !buf || !targetGain) return;
    if (this[currentSrcProp]) {
      try { this[currentSrcProp].stop(); } catch (_) {}
      this[currentSrcProp] = null;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(targetGain);
    src.start();
    this[currentSrcProp] = src;
  }

  async _preloadAssets() {
    if (!this.ctx || typeof fetch !== 'function') return;
    const entries = Object.entries(SFX_ASSETS);
    const total = entries.length;

    await Promise.all(entries.map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        // Guard against Vite dev server returning index.html on missing public/audio/* files
        if (ct.includes('text/html')) return;
        const arrBuf = await res.arrayBuffer();
        if (!arrBuf || arrBuf.byteLength < 128) return;
        const decoded = await this.ctx.decodeAudioData(arrBuf.slice(0));
        this.bufferCache[key] = decoded;
        this.assetsLoadedCount += 1;
        if (this.onAssetStatus) this.onAssetStatus(this.assetsLoadedCount, total);

        if (key === 'horrorAmbience' && !this.ambienceMutedBySequence) {
          this._startBufferLoop('horrorAmbience', this.bgAmbienceGain, 'bgAmbienceSrc');
        } else if (key === 'scaryWind' && !this.ambienceMutedBySequence) {
          this._startBufferLoop('scaryWind', this.bgWindGain, 'bgWindSrc');
        }
      } catch (_) {
        // Local studio file not present or unreadable; procedural fallback handles playback seamlessly
      }
    }));
  }

  _ensureAmbiencePlaying() {
    if (!this.ctx || this.muted) return;
    this.ambienceMutedBySequence = false;
    const t = this.ctx.currentTime;
    if (this.bgAmbienceGain) {
      this.bgAmbienceGain.gain.setTargetAtTime(0.24, t, 0.25);
    }
    if (this.bgWindGain) {
      this.bgWindGain.gain.setTargetAtTime(0.10, t, 0.25);
    }
    if (this.bufferCache.horrorAmbience && !this.bgAmbienceSrc) {
      this._startBufferLoop('horrorAmbience', this.bgAmbienceGain, 'bgAmbienceSrc');
    }
    if (this.bufferCache.scaryWind && !this.bgWindSrc) {
      this._startBufferLoop('scaryWind', this.bgWindGain, 'bgWindSrc');
    } else if (!this.bgWindSrc) {
      this._startProceduralWindBed();
    }
  }

  // Play a pre-decoded AudioBuffer with pitch/trim/fade; falls back to procedural Web Audio
  _playAsset(key, opts = {}, fallbackFn = null) {
    if (this.muted || !this.ctx) return;
    const buf = this.bufferCache[key];
    if (!buf) {
      if (fallbackFn) fallbackFn();
      return;
    }
    try {
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const rate = opts.rate || 1.0;
      src.playbackRate.value = rate;

      const gain = this.ctx.createGain();
      const vol = Math.max(0.001, Math.min(1, opts.volume ?? 0.85));
      gain.gain.setValueAtTime(vol, t);

      const startSec = Math.max(0, Math.min(buf.duration - 0.05, opts.startSec || 0));
      const maxDurSec = opts.maxDurationMs ? opts.maxDurationMs / 1000 : null;

      src.connect(gain);
      this._connectOut(gain, opts.wet ?? 0.22);

      if (maxDurSec && maxDurSec > 0.1) {
        const fadeStart = Math.max(t + 0.02, t + maxDurSec - 0.18);
        gain.gain.setValueAtTime(vol, fadeStart);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + maxDurSec);
        src.start(t, startSec, (maxDurSec + 0.05) * rate);
      } else {
        src.start(t, startSec);
      }
    } catch (_) {
      if (fallbackFn) fallbackFn();
    }
  }

  _connectOut(node, wetAmount = 0.35) {
    node.connect(this.masterGain);
    if (this.reverbSend && wetAmount > 0) {
      const wg = this.ctx.createGain();
      wg.gain.value = wetAmount;
      node.connect(wg);
      wg.connect(this.reverbSend);
    }
  }

  _noise(buffer, startTime, duration, offset = null) {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const off = offset !== null ? offset : Math.random() * 1.5;
    src.start(startTime, off, duration);
    return src;
  }

  setMuted(m) {
    this.muted = m;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : 0.88, this.ctx.currentTime, 0.05);
    }
  }

  update(fear01, tvProx01, phoneRinging, nowSec) {
    if (!this.started || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (performance.now() < this.deadSilenceUntil) {
      this.droneGain.gain.setTargetAtTime(0.001, t, 0.06);
      this.staticGain.gain.setTargetAtTime(0.0005, t, 0.06);
      if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.001, t, 0.06);
      if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0005, t, 0.06);
      return;
    }

    if (!this.ambienceMutedBySequence) {
      this.droneGain.gain.setTargetAtTime(0.06 + fear01 * 0.16, t, 0.2);
      this.staticGain.gain.setTargetAtTime(0.003 + tvProx01 * 0.065 + fear01 * 0.04, t, 0.2);
      if (this.bgAmbienceGain) {
        this.bgAmbienceGain.gain.setTargetAtTime(Math.min(0.62, 0.24 + fear01 * 0.36), t, 0.2);
      }
      if (this.bgWindGain) {
        this.bgWindGain.gain.setTargetAtTime(Math.min(0.28, 0.08 + fear01 * 0.16), t, 0.2);
      }
    }

    if (nowSec - this.lastTick > 1.0) { this.lastTick = nowSec; this.playClockTick(); }
    if (phoneRinging && nowSec - this.lastRing > 2.8) {
      this.lastRing = nowSec;
      this.playPhoneRing();
    }
    if (fear01 > 0.24) {
      const interval = Math.max(0.34, 1.25 - fear01 * 0.88);
      if (nowSec - this.lastBeat > interval) {
        this.lastBeat = nowSec;
        this.playHeartbeat(0.16 + fear01 * 0.38);
      }
    }
  }

  // 1. CREAKY DOOR
  playDoorCreak(isClosing = false) {
    this.init();
    this._playAsset(
      isClosing ? 'doorClose' : 'doorOpen',
      { volume: 0.92, rate: isClosing ? 0.95 : 0.92 },
      () => this._synthDoorCreakFallback(isClosing)
    );
  }

  // 2. WARDROBE CREAK (Deep pitched creak + cloth rustle layer)
  playWardrobeCreak(slowEerie = false) {
    this.init();
    this._playAsset(
      'doorOpen',
      { volume: 0.88, rate: slowEerie ? 0.62 : 0.72 },
      () => this._synthDoorCreakFallback(false)
    );
    if (this.ctx && !this.muted) {
      const t = this.ctx.currentTime;
      const clothSrc = this._noise(this.whiteBuf, t + 0.18, 0.75);
      const clothFlt = this.ctx.createBiquadFilter();
      clothFlt.type = 'bandpass'; clothFlt.frequency.value = 2150; clothFlt.Q.value = 1.9;
      const clothG = this.ctx.createGain();
      clothG.gain.setValueAtTime(0.001, t + 0.18);
      clothG.gain.linearRampToValueAtTime(0.055, t + 0.42);
      clothG.gain.exponentialRampToValueAtTime(0.001, t + 0.92);
      clothSrc.connect(clothFlt); clothFlt.connect(clothG);
      this._connectOut(clothG, 0.3);
    }
  }

  // Heavy wardrobe slam
  playWardrobeSlam() {
    this.init();
    this._playAsset('doorClose', { volume: 0.95, rate: 1.35 }, () => this._synthDoorCreakFallback(true));
    this._playAsset('terrorSweep', { volume: 0.55, maxDurationMs: 1400 }, () => this._synthSweepFallback(0.42));
    this.playDoorSlam();
  }

  // 3. PICTURE FRAME FALL & GLASS SHATTER
  playPortraitFall() {
    this.init();
    this._playAsset('glassHit', { volume: 0.95, maxDurationMs: 2200 }, () => this._synthGlassFallback(true));
    setTimeout(() => {
      this._playAsset('glassDebris', { volume: 0.72, rate: 1.15, maxDurationMs: 1600 }, () => this._synthGlassFallback(false));
    }, 180);
    if (this.ctx && !this.muted) {
      const t = this.ctx.currentTime;
      const thump = this.ctx.createOscillator();
      const thG = this.ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(98, t);
      thump.frequency.exponentialRampToValueAtTime(24, t + 0.26);
      thG.gain.setValueAtTime(0.6, t);
      thG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      thump.connect(thG); this._connectOut(thG, 0.55);
      thump.start(t); thump.stop(t + 0.3);
    }
  }

  // 4A. WOOD-GRAIN CLAW SCRATCHING
  playWoodScratch(strokes = 5) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    let cursor = 0;

    for (let i = 0; i < strokes; i++) {
      const st = t + cursor;
      const dur = 0.16 + Math.random() * 0.09;
      cursor += dur + 0.05 + Math.random() * 0.08;

      const src = this._noise(this.whiteBuf, st, dur);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      const fStart = 1800 + Math.random() * 550;
      bp.frequency.setValueAtTime(fStart, st);
      bp.frequency.linearRampToValueAtTime(fStart + 950, st + dur * 0.65);
      bp.frequency.linearRampToValueAtTime(fStart - 250, st + dur);
      bp.Q.value = 4.6;

      const woodRes = this.ctx.createBiquadFilter();
      woodRes.type = 'bandpass'; woodRes.frequency.value = 420 + Math.random() * 140; woodRes.Q.value = 5.5;

      const grainLfo = this.ctx.createOscillator();
      const grainG = this.ctx.createGain();
      grainLfo.frequency.value = 58 + Math.random() * 28;
      grainG.gain.value = 0.16;

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.001, st);
      env.gain.linearRampToValueAtTime(0.42, st + 0.025);
      env.gain.setValueAtTime(0.32, st + dur * 0.7);
      env.gain.exponentialRampToValueAtTime(0.001, st + dur);
      grainLfo.connect(grainG); grainG.connect(env.gain);

      src.connect(bp); src.connect(woodRes);
      bp.connect(env); woodRes.connect(env);
      this._connectOut(env, 0.45);
      grainLfo.start(st); grainLfo.stop(st + dur + 0.02);
    }
  }

  // 4B. RED FOX CRY AT NIGHT
  playFoxCry(distant = true) {
    this.init();
    this._playAsset(
      'foxCry',
      { volume: distant ? 0.52 : 0.85, startSec: 1.0, maxDurationMs: 4200 },
      () => this._synthFoxFallback(distant)
    );
  }

  // 5. SUBTLE FLOORBOARD CREAK
  playFloorCreak() {
    this.init();
    this._playAsset(
      'doorClose',
      { volume: 0.28, rate: 1.45, maxDurationMs: 420 },
      () => this._synthFloorCreakFallback()
    );
  }

  // 6. HEAVY WOOD KNOCKS
  playThreeKnocks() {
    this.init();
    this._playAsset('doorKnock', { volume: 0.95, rate: 0.85 }, () => this._synthKnocksFallback());
  }

  // 7. PSYCHOLOGICAL TENSION STING
  playScareChord() {
    this.init();
    this._playAsset('terrorSweep', { volume: 0.72, maxDurationMs: 2400 }, () => this._synthSweepFallback(0.55));
    if (this.ctx && !this.muted) {
      const t = this.ctx.currentTime;
      const sub = this.ctx.createOscillator(), sg = this.ctx.createGain();
      sub.type = 'sine'; sub.frequency.setValueAtTime(88, t); sub.frequency.exponentialRampToValueAtTime(22, t + 0.8);
      sg.gain.setValueAtTime(0.7, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      sub.connect(sg); this._connectOut(sg, 0.55); sub.start(t); sub.stop(t + 0.9);
    }
  }

  // 8. SUBTLE LOW-PRESSURE ROOM SIGH
  playHeavyBreath(vol = 0.5) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.brownBuf, t, 0.9);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 180;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(Math.min(0.16, vol * 0.22), t + 0.28);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    src.connect(lp); lp.connect(g); this._connectOut(g, 0.5);
  }

  playLoopReset() {
    this.init();
    this._playAsset('horrorSweep', { volume: 0.85, maxDurationMs: 2800 }, () => this._synthSweepFallback(0.65));
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(160, t); osc.frequency.exponentialRampToValueAtTime(26, t + 1.1);
    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.15);
    osc.connect(g); this._connectOut(g, 0.5); osc.start(t); osc.stop(t + 1.2);
  }

  playPhoneRing() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.45].forEach((off) => {
      const osc1 = this.ctx.createOscillator(), osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc1.type = 'sine'; osc1.frequency.value = 780;
      osc2.type = 'sine'; osc2.frequency.value = 812;
      g.gain.setValueAtTime(0.001, t + off);
      g.gain.linearRampToValueAtTime(0.11, t + off + 0.03);
      g.gain.setValueAtTime(0.11, t + off + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.36);
      osc1.connect(g); osc2.connect(g); this._connectOut(g, 0.45);
      osc1.start(t + off); osc2.start(t + off);
      osc1.stop(t + off + 0.38); osc2.stop(t + off + 0.38);
    });
  }

  playClockTick() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(1050, t);
    g.gain.setValueAtTime(0.012, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.025);
    osc.connect(g); g.connect(this.masterGain); osc.start(t); osc.stop(t + 0.03);
  }

  playHeartbeat(vol) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.15].forEach((off, idx) => {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 64 : 48, t + off);
      osc.frequency.exponentialRampToValueAtTime(22, t + off + 0.15);
      g.gain.setValueAtTime(0.001, t + off);
      g.gain.linearRampToValueAtTime(vol * (idx === 0 ? 1 : 0.72), t + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.2);
      osc.connect(g); g.connect(this.masterGain); osc.start(t + off); osc.stop(t + off + 0.22);
    });
  }

  playBreakerSnap() {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(280, t); osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    g.gain.setValueAtTime(0.38, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g); this._connectOut(g, 0.35); osc.start(t); osc.stop(t + 0.1);
  }

  playDoorSlam() {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(98, t); osc.frequency.exponentialRampToValueAtTime(20, t + 0.36);
    g.gain.setValueAtTime(0.62, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g); this._connectOut(g, 0.65); osc.start(t); osc.stop(t + 0.42);
  }

  playGlassCrack() {
    this.init();
    this._playAsset('glassHit', { volume: 0.9, maxDurationMs: 1800 }, () => this._synthGlassFallback(true));
  }

  playScratchBurst() {
    this.playWoodScratch(5);
  }

  playMatchStrike() {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.whiteBuf, t, 0.26);
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    src.connect(hp); hp.connect(g); this._connectOut(g, 0.2);
  }

  playMemoryChime(warm = false) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const notes = warm ? [261.63, 329.63, 392.0, 523.25] : [293.66, 349.23, 440.0, 523.25];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.001, t + i * 0.16); g.gain.linearRampToValueAtTime(0.1, t + i * 0.16 + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.16 + 2.4);
      osc.connect(g); this._connectOut(g, 0.55); osc.start(t + i * 0.16); osc.stop(t + i * 0.16 + 2.5);
    });
  }

  playFootstep(vol = 0.28, heavy = false) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(heavy ? 75 : (115 + Math.random() * 25), t);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 24 : 36, t + (heavy ? 0.16 : 0.1));
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.18 : 0.11));
    osc.connect(g); this._connectOut(g, heavy ? 0.5 : 0.28); osc.start(t); osc.stop(t + (heavy ? 0.19 : 0.12));

    const src = this._noise(this.brownBuf, t, 0.065);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = heavy ? 420 : (750 + Math.random() * 200); bp.Q.value = 1.6;
    const ng = this.ctx.createGain(); ng.gain.setValueAtTime(vol * 0.85, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
    src.connect(bp); bp.connect(ng); this._connectOut(ng, 0.25);

    if (!heavy && Math.random() < 0.18) {
      setTimeout(() => this.playFloorCreak(), 40);
    }
  }

  // 9. DISTANT DOG BARKS IN THE ALLEY
  playDogBark(distant = true) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const offsets = [0, 0.34, 0.78];
    offsets.forEach((off, idx) => {
      const st = t + off;
      const dur = idx === 2 ? 0.24 : 0.17;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const bp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      const baseF = 165 + (idx === 1 ? 25 : 0);
      osc.frequency.setValueAtTime(baseF * 1.45, st);
      osc.frequency.exponentialRampToValueAtTime(baseF * 0.72, st + dur);
      osc2.frequency.setValueAtTime(baseF * 2.1, st);
      osc2.frequency.exponentialRampToValueAtTime(baseF * 0.95, st + dur);

      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(distant ? 540 : 720, st);
      bp.frequency.exponentialRampToValueAtTime(320, st + dur);
      bp.Q.value = 2.6;

      const peak = distant ? 0.22 : 0.36;
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(peak, st + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur);

      osc.connect(bp); osc2.connect(bp);
      bp.connect(g);
      this._connectOut(g, 0.75);
      osc.start(st); osc2.start(st);
      osc.stop(st + dur + 0.03); osc2.stop(st + dur + 0.03);

      const nSrc = this._noise(this.brownBuf, st, dur);
      const nBp = this.ctx.createBiquadFilter();
      nBp.type = 'bandpass'; nBp.frequency.value = 620; nBp.Q.value = 1.8;
      const nG = this.ctx.createGain();
      nG.gain.setValueAtTime(0.001, st);
      nG.gain.linearRampToValueAtTime(peak * 0.7, st + 0.02);
      nG.gain.exponentialRampToValueAtTime(0.001, st + dur);
      nSrc.connect(nBp); nBp.connect(nG); this._connectOut(nG, 0.65);
    });
  }

  // 10. SOFT RAIN & GENTLE LOOPING ENDING MUSIC
  playSoftRain() {
    this.init();
    if (!this.ctx || this.muted) return;
    if (this.rainSrc) return;
    const t0 = this.ctx.currentTime;
    this.ambienceMutedBySequence = true;
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.0001, t0, 0.7);
    if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.0001, t0, 0.5);
    if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.0001, t0, 0.7);
    if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0001, t0, 0.7);

    const src = this.ctx.createBufferSource();
    src.buffer = this.whiteBuf;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1150; bp.Q.value = 0.65;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2400;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.055, t0 + 1.6);
    src.connect(bp); bp.connect(lp); lp.connect(g);
    this._connectOut(g, 0.45);
    src.start(t0);
    this.rainSrc = src;
    this.rainGain = g;
  }

  stopSoftRain() {
    if (this.rainGain && this.ctx) {
      const t = this.ctx.currentTime;
      try {
        this.rainGain.gain.cancelScheduledValues(t);
        this.rainGain.gain.setTargetAtTime(0.0001, t, 0.35);
      } catch (_) {}
    }
    if (this.rainSrc) {
      const oldSrc = this.rainSrc;
      this.rainSrc = null;
      this.rainGain = null;
      setTimeout(() => { try { oldSrc.stop(); } catch (_) {} }, 900);
    }
  }

  stopEndingMelody() {
    this.stopSoftRain();
    this.endingPlaying = false;
    if (this.endingLoopTimer) {
      clearTimeout(this.endingLoopTimer);
      this.endingLoopTimer = null;
    }
    if (this.endingBus && this.ctx) {
      const t = this.ctx.currentTime;
      try {
        this.endingBus.gain.cancelScheduledValues(t);
        this.endingBus.gain.setTargetAtTime(0.0001, t, 0.25);
      } catch (_) {}
    }
    this._ensureAmbiencePlaying();
  }

  playEndingMelody() {
    this.init();
    if (!this.ctx) return;
    if (this.endingPlaying) return;
    this.endingPlaying = true;
    this.ambienceMutedBySequence = true;

    const tStart = this.ctx.currentTime;
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.0001, tStart, 0.8);
    if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.0001, tStart, 0.6);
    if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.0001, tStart, 0.8);
    if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0001, tStart, 0.8);

    if (!this.endingBus) {
      this.endingBus = this.ctx.createGain();
      this.endingBus.gain.value = 1.0;
      this._connectOut(this.endingBus, 0.82);
    } else {
      this.endingBus.gain.cancelScheduledValues(tStart);
      this.endingBus.gain.setValueAtTime(0.001, tStart);
      this.endingBus.gain.linearRampToValueAtTime(1.0, tStart + 0.8);
    }

    const schedulePhrase = () => {
      if (!this.endingPlaying || !this.ctx) return;
      const t0 = this.ctx.currentTime + 0.06;

      const piano = (freq, off, dur = 4.6, vol = 0.085) => {
        const st = t0 + off;
        const o1 = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        const lp = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        o1.type = 'sine'; o1.frequency.value = freq;
        o2.type = 'triangle'; o2.frequency.value = freq * 2;
        g2.gain.value = 0.11;
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1250, st);
        lp.frequency.exponentialRampToValueAtTime(480, st + dur);

        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(vol, st + 0.055);
        g.gain.exponentialRampToValueAtTime(vol * 0.45, st + 0.9);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);

        o1.connect(lp); o2.connect(g2); g2.connect(lp);
        lp.connect(g); g.connect(this.endingBus);
        o1.start(st); o2.start(st);
        o1.stop(st + dur + 0.08); o2.stop(st + dur + 0.08);
      };

      const cello = (freq, off, dur = 4.4, vol = 0.062) => {
        const st = t0 + off;
        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const subG = this.ctx.createGain();
        const vib = this.ctx.createOscillator();
        const vibG = this.ctx.createGain();
        const lp = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth'; osc.frequency.value = freq;
        sub.type = 'sine'; sub.frequency.value = freq * 0.5;
        subG.gain.value = 0.28;

        vib.type = 'sine'; vib.frequency.value = 5.1;
        vibG.gain.setValueAtTime(0.0, st);
        vibG.gain.linearRampToValueAtTime(freq * 0.0065, st + Math.min(1.4, dur * 0.45));
        vib.connect(vibG); vibG.connect(osc.frequency);

        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(620, st);
        lp.frequency.linearRampToValueAtTime(980, st + dur * 0.42);
        lp.frequency.linearRampToValueAtTime(520, st + dur);
        lp.Q.value = 1.4;

        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(vol, st + Math.min(1.15, dur * 0.35));
        g.gain.setValueAtTime(vol * 0.88, st + dur * 0.72);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);

        osc.connect(lp); sub.connect(subG); subG.connect(lp);
        lp.connect(g); g.connect(this.endingBus);
        osc.start(st); sub.start(st); vib.start(st);
        osc.stop(st + dur + 0.08); sub.stop(st + dur + 0.08); vib.stop(st + dur + 0.08);
      };

      const pad = (freqs, off, dur = 6.2, vol = 0.024) => {
        const st = t0 + off;
        freqs.forEach((f) => {
          const o = this.ctx.createOscillator();
          const lp = this.ctx.createBiquadFilter();
          const g = this.ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          lp.type = 'lowpass'; lp.frequency.value = 720;
          g.gain.setValueAtTime(0.0001, st);
          g.gain.linearRampToValueAtTime(vol, st + 1.5);
          g.gain.setValueAtTime(vol * 0.85, st + dur - 1.6);
          g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
          o.connect(lp); lp.connect(g); g.connect(this.endingBus);
          o.start(st); o.stop(st + dur + 0.1);
        });
      };

      // Bar 1: Dm9 (0.0s - 6.0s)
      pad([73.42, 146.83, 220.00, 261.63], 0.0, 6.2, 0.024);
      piano(146.83, 0.00, 5.2, 0.082);
      piano(220.00, 0.85, 4.4, 0.072);
      piano(293.66, 1.70, 4.4, 0.078);
      piano(329.63, 2.55, 4.6, 0.088);
      piano(349.23, 3.55, 4.2, 0.082);
      piano(329.63, 4.65, 3.6, 0.070);
      cello(329.63, 1.60, 4.2, 0.056);

      // Bar 2: Bbmaj7 (6.0s - 12.0s)
      pad([116.54, 174.61, 220.00, 293.66], 6.0, 6.2, 0.024);
      piano(116.54, 6.00, 5.2, 0.082);
      piano(174.61, 6.85, 4.4, 0.072);
      piano(293.66, 7.70, 4.4, 0.078);
      piano(440.00, 8.60, 4.8, 0.090);
      piano(392.00, 9.75, 4.0, 0.078);
      piano(349.23, 10.80, 3.8, 0.072);
      cello(440.00, 7.20, 4.6, 0.062);

      // Bar 3: Gm9 (12.0s - 18.0s)
      pad([98.00, 146.83, 233.08, 293.66], 12.0, 6.2, 0.024);
      piano(98.00,  12.00, 5.2, 0.082);
      piano(196.00, 12.85, 4.4, 0.072);
      piano(233.08, 13.70, 4.4, 0.076);
      piano(349.23, 14.55, 4.6, 0.086);
      piano(329.63, 15.65, 4.2, 0.080);
      piano(293.66, 16.75, 4.0, 0.074);
      cello(349.23, 13.10, 2.7, 0.056);
      cello(329.63, 15.55, 2.8, 0.054);

      // Bar 4: Asus4 -> A7 -> gentle return to Dm9 (18.0s - 25.0s)
      pad([110.00, 164.81, 220.00, 293.66], 18.0, 6.8, 0.025);
      piano(110.00, 18.00, 5.6, 0.084);
      piano(164.81, 18.90, 4.6, 0.072);
      piano(293.66, 19.80, 4.6, 0.084);
      piano(277.18, 21.15, 4.8, 0.080);
      piano(220.00, 22.55, 4.4, 0.072);
      piano(261.63, 23.80, 3.8, 0.068);
      cello(293.66, 18.80, 3.2, 0.056);
      cello(277.18, 21.60, 3.4, 0.050);

      this.endingLoopTimer = setTimeout(schedulePhrase, 24800);
    };

    schedulePhrase();
  }

  // Water drip & faucet toggle SFX for Kitchen / Bathroom
  playWaterDrip() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920 + Math.random() * 180, t);
    osc.frequency.exponentialRampToValueAtTime(1680 + Math.random() * 240, t + 0.055);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(g);
    this._connectOut(g, 0.55);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playFaucetToggle(turningOff = true) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(turningOff ? 520 : 340, t);
    osc.frequency.exponentialRampToValueAtTime(turningOff ? 260 : 620, t + 0.14);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(g);
    this._connectOut(g, 0.35);
    osc.start(t);
    osc.stop(t + 0.17);

    const dur = turningOff ? 0.25 : 0.75;
    const src = this._noise(this.whiteBuf, t + 0.04, dur);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1850;
    bp.Q.value = 1.4;
    const wg = this.ctx.createGain();
    wg.gain.setValueAtTime(turningOff ? 0.14 : 0.001, t + 0.04);
    if (!turningOff) wg.gain.linearRampToValueAtTime(0.16, t + 0.22);
    wg.gain.exponentialRampToValueAtTime(0.001, t + 0.04 + dur);
    src.connect(bp);
    bp.connect(wg);
    this._connectOut(wg, 0.45);
  }

  // Khoảng lặng chết (Dead Silence) trước biến cố lớn
  triggerDeadSilence(durationMs = 1700) {
    this.deadSilenceUntil = Math.max(this.deadSilenceUntil, performance.now() + durationMs);
    if (this.ctx) {
      const t = this.ctx.currentTime;
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.001, t, 0.05);
      if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.0005, t, 0.05);
      if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.001, t, 0.05);
      if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0005, t, 0.05);
    }
  }

  _connectPanned(node, pan = 0, wetAmount = 0.38) {
    const clampedPan = Math.max(-0.95, Math.min(0.95, pan));
    if (this.ctx && typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = clampedPan;
      node.connect(panner);
      this._connectOut(panner, wetAmount);
    } else {
      this._connectOut(node, wetAmount);
    }
  }

  playSpatialWhisper(pan = 0.8) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const dur = 1.15;
    const src = this._noise(this.whiteBuf, t, dur);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1650, t);
    bp.frequency.exponentialRampToValueAtTime(920, t + 0.55);
    bp.frequency.exponentialRampToValueAtTime(2150, t + dur);
    bp.Q.value = 5.2;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.24, t + 0.18);
    g.gain.setValueAtTime(0.16, t + 0.65);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g);
    this._connectPanned(g, pan, 0.5);
  }

  playMatchBlowOut(pan = -0.65) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.brownBuf, t, 0.65);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(780, t);
    bp.frequency.exponentialRampToValueAtTime(240, t + 0.6);
    bp.Q.value = 1.8;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.46, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
    src.connect(bp); bp.connect(g);
    this._connectPanned(g, pan, 0.32);

    const fizz = this._noise(this.whiteBuf, t + 0.09, 0.24);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3200;
    const fg = this.ctx.createGain();
    fg.gain.setValueAtTime(0.14, t + 0.09);
    fg.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    fizz.connect(hp); hp.connect(fg);
    this._connectPanned(fg, pan * 0.5, 0.18);
  }

  playSpatialKnock(pan = 0) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.34, 0.72].forEach((off) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 18, t + off);
      osc.frequency.exponentialRampToValueAtTime(34, t + off + 0.14);
      g.gain.setValueAtTime(0.44, t + off);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.17);
      osc.connect(g);
      this._connectPanned(g, pan, 0.52);
      osc.start(t + off);
      osc.stop(t + off + 0.19);
    });
  }

  // --- PROCEDURAL WEB AUDIO FALLBACKS (ZERO EXTERNAL DEPENDENCY) ---
  _synthDoorCreakFallback(isClosing) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isClosing ? 920 : 680, t);
    osc.frequency.exponentialRampToValueAtTime(isClosing ? 620 : 1180, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.72);
    f.type = 'bandpass'; f.frequency.value = 1650; f.Q.value = 12;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    osc.connect(f); f.connect(g); this._connectOut(g, 0.45);
    osc.start(t); osc.stop(t + 0.8);
  }

  _synthFloorCreakFallback() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520 + Math.random() * 160, t);
    osc.frequency.exponentialRampToValueAtTime(310, t + 0.24);
    f.type = 'bandpass'; f.frequency.value = 1150; f.Q.value = 9;
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    osc.connect(f); f.connect(g); this._connectOut(g, 0.3);
    osc.start(t); osc.stop(t + 0.28);
  }

  _synthGlassFallback(heavy = true) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const shards = heavy ? 6 : 4;
    for (let i = 0; i < shards; i++) {
      const st = t + i * (heavy ? 0.025 : 0.055) + Math.random() * 0.02;
      const dur = 0.09 + Math.random() * 0.14;
      const src = this._noise(this.whiteBuf, st, dur);
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 2800 + Math.random() * 3400;
      hp.Q.value = 6.5;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(heavy ? 0.26 : 0.14, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur);
      src.connect(hp); hp.connect(g);
      this._connectOut(g, 0.45);
    }
  }

  _synthSweepFallback(vol = 0.5) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.brownBuf, t, 1.45);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(140, t);
    bp.frequency.exponentialRampToValueAtTime(1280, t + 0.55);
    bp.frequency.exponentialRampToValueAtTime(95, t + 1.4);
    bp.Q.value = 2.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol * 0.42, t + 0.22);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.42);
    src.connect(bp); bp.connect(g);
    this._connectOut(g, 0.65);
  }

  _synthFoxFallback(distant) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1220, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.7);
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 4;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(distant ? 0.2 : 0.32, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.72);
    osc.connect(f); f.connect(g); this._connectOut(g, 0.6);
    osc.start(t); osc.stop(t + 0.75);
  }

  _synthKnocksFallback() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.4, 0.84].forEach((off) => {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(135, t + off); osc.frequency.exponentialRampToValueAtTime(34, t + off + 0.14);
      g.gain.setValueAtTime(0.45, t + off); g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.18);
      osc.connect(g); this._connectOut(g, 0.55); osc.start(t + off); osc.stop(t + off + 0.2);
    });
  }
}
```

---

### <a id="src-config-heldPaperContent-js"></a> Tập tin: `src/config/heldPaperContent.js` (115 dòng)

```javascript
export function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split('\n');
  let curY = y;
  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    if (!para.trim()) {
      curY += lineHeight * 0.65;
      continue;
    }
    const words = para.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line ? `${line} ${words[n]}` : words[n];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = words[n];
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, curY);
      curY += lineHeight;
    }
  }
  return curY;
}

export function getHeldPaperContent(kind, loopNum) {
  if (kind === 'kitchen_note') {
    if (loopNum === 1) {
      return {
        theme: 'sticky',
        header: 'GIẤY NHẮN CỦA ALICE',
        body: '“Steve, em mua sẵn cháo để trong tủ lạnh, anh nhớ hâm lại ăn tối nha.”',
        note: 'Lạ thật... sao mép tờ giấy nhắn này lại ố vàng và quăn góc như đã để ở đây rất lâu rồi?',
        voice: 'Giấy nhắn của Alice: Steve, em mua sẵn cháo để trong tủ lạnh, anh nhớ hâm lại ăn tối nha.'
      };
    }
    if (loopNum <= 3) {
      return {
        theme: 'wet',
        header: 'GIẤY NHẮN NHÒE NƯỚC · 14/11',
        body: '“Trời mưa to quá Steve, em đứng ngoài cửa lâu rồi. Đừng khóa cửa ngủ quên nhé.”',
        note: 'Nét mực loang ra vì nước mưa lạnh. Chờ đã... không phải kẻ lạ gõ cửa sao?',
        voice: 'Giấy nhắn nhòe nước của Alice: Trời mưa to quá Steve, em đứng ngoài cửa lâu rồi. Đừng khóa cửa ngủ quên nhé.'
      };
    }
    return {
      theme: 'scrawl',
      header: 'MẶT SAU TỜ GIẤY NHẮN',
      body: '“Mình không hề ngủ quên. Lúc đó mình nghe rõ tiếng gõ cửa của Alice — nhưng vì giận dỗi, mình đã cố tình chốt khóa và bật Im lặng.”',
      note: 'Nét chữ nguệch ngoạc của chính Steve, hằn sâu xuống mặt giấy.',
      voice: 'Mặt sau tờ giấy nhắn: Mình không hề ngủ quên. Lúc đó mình nghe rõ tiếng gõ cửa của Alice, nhưng mình đã cố tình chốt khóa và bật Im lặng.'
    };
  }

  if (kind === 'fridge_note') {
    return {
      theme: 'frost',
      header: 'MẨU GIẤY ĐÓNG BĂNG · 02:14',
      body: '“Đừng giả vờ chờ nữa, Steve.”',
      note: 'Nằm cứng đờ cạnh hộp cháo đã mốc xanh. Đêm 14/11 đã qua từ nhiều tuần trước.',
      voice: 'Mẩu giấy đóng băng trong tủ lạnh: Đừng giả vờ chờ nữa, Steve.'
    };
  }

  // Option A: Unreliable Narrator progression (Loop 1 -> Loop 5)
  if (loopNum === 1) {
    return {
      theme: 'calendar',
      header: 'GHI CHÚ BÀN LÀM VIỆC · 02:14',
      body: '“Hẻm tối và mưa lớn lắm. Nếu nửa đêm có tiếng gõ cửa lạ, khoan hãy mở — kiểm tra kỹ chốt khóa trước đã.”',
      note: 'Mình viết dòng này lúc nào nhỉ? Nhưng tiếng gõ ngoài cửa chính vẫn đang vang lên... Ra kiểm tra cửa chính xem sao.',
      voice: 'Ghi chú trên bàn làm việc: Hẻm tối và mưa lớn lắm. Nếu nửa đêm có tiếng gõ cửa lạ, khoan hãy mở, kiểm tra kỹ chốt khóa trước đã.'
    };
  }
  if (loopNum === 2) {
    return {
      theme: 'sticky',
      header: '23:40 · HÓA ĐƠN QUÁN ĐÊM (14/11)',
      body: '2 phần cháo nóng mang về.\n\n“Steve, trời mưa rồi, em ghé mua cháo về cho anh ăn tối.” — Alice',
      note: 'Khoan đã... Hóa đơn ghi 14/11, nhưng hộp cháo trong tủ lạnh đã lạnh ngắt và mốc xanh từ lâu! Hôm nay thật sự là ngày mấy?',
      voice: 'Hóa đơn quán đêm ngày 14 tháng 11 lúc 23 giờ 40: Hai phần cháo nóng mang về. Khoan đã, nếu mới mua tối nay, sao hộp cháo trong tủ lạnh đã mốc xanh?'
    };
  }
  if (loopNum === 3) {
    return {
      theme: 'report',
      header: '02:08 · NHẬT KÝ CUỘC GỌI & TỜ LỊCH XÉ DỞ',
      body: '02:05 — Cuộc gọi nhỡ: Alice\n02:06 — Cuộc gọi nhỡ: Alice\n02:07 — Cuộc gọi nhỡ: Alice\n02:08 — Cuộc gọi nhỡ: Alice (Chế độ Im lặng)\n\n[Lịch bàn bị gạch chéo suốt 3 tuần kể từ 14/11]',
      note: 'Không phải kẻ lạ... Đêm 14/11 đã trôi qua 3 tuần rồi! Người gọi 4 cuộc liên tiếp trong mưa là Alice — còn máy mình lại bật Im lặng.',
      voice: '02 giờ 08, nhật ký cuộc gọi nhỡ: Bốn cuộc gọi liên tiếp từ Alice khi điện thoại đang bật Im lặng. Tờ lịch bàn đã bị gạch chéo suốt ba tuần kể từ ngày 14 tháng 11.'
    };
  }
  if (loopNum === 4) {
    return {
      theme: 'wet',
      header: '02:09 · TIN NHẮN THOẠI CỦA ALICE',
      body: '“Steve... anh bảo cứ gọi mà... Em đứng gõ cửa mãi mà không thấy anh ra, điện thoại cũng không bắt máy... Chắc anh ngủ say rồi hả. Không sao đâu, em tự đi qua đầu hẻm được. Chuyện lúc tối, mai mình nói tiếp nha. Anh ngủ ngon.”',
      note: 'Tiếng gõ cửa đáng sợ mà mình cố khóa lại suốt bấy lâu nay... hóa ra chính là Alice đứng ngoài trời mưa cầu cứu.',
      voice: '02 giờ 09, tin nhắn thoại của Alice: Steve, em đứng gõ cửa mãi không thấy anh ra. Không sao đâu, em tự đi qua đầu hẻm được. Chuyện lúc tối, mai mình nói tiếp nha. Anh ngủ ngon.'
    };
  }
  return {
    theme: 'certificate',
    header: 'GIẤY BÁO TỬ · ALICE',
    subHeader: '14 THÁNG 11 · 02:14 SÁNG',
    body: 'Alice đã không qua khỏi sau vụ tai nạn ngay đầu con hẻm tối trong đêm mưa 14/11 — chỉ 5 phút sau khi rời khỏi bậc cửa căn nhà này.',
    note: 'Chốt cửa chưa từng khóa từ bên ngoài... Bóng Đen chính là ký ức mình đang cố nhốt lại. Ngoài kia trời sắp sáng rồi.',
    voice: 'Giấy báo tử của Alice, ngày 14 tháng 11 lúc 02 giờ 14 sáng: Alice đã không qua khỏi sau vụ tai nạn ngay đầu con hẻm. Chốt cửa chưa từng khóa từ bên ngoài.'
  };
}
```

---

### <a id="src-config-settings-js"></a> Tập tin: `src/config/settings.js` (77 dòng)

```javascript
import * as THREE from 'three';

export const SETTINGS_KEY = 'vong_lap_settings_v3';

export const DEFAULT_SETTINGS = {
  graphics: 'low',    // 'low' | 'medium' | 'high'
  fpsLimit: 60,       // 30 | 60 | 120 | 0 (unlimited)
  showFps: false,
  camSmooth: true,
  sensitivity: 1.0
};

export const GFX_PRESETS = {
  low: {
    label: 'Thấp',
    desc: 'Tắt đổ bóng, tắt hạt bụi & nhiễu phim, tối ưu độ phân giải (0.85x) và giảm cập nhật texture phụ — mượt tối đa trên máy yếu/iGPU.',
    maxDpr: 0.85,
    shadows: false,
    shadowType: THREE.BasicShadowMap,
    shadowSize: 256,
    dust: false,
    wallBump: 0,
    floorBump: 0,
    tvSkip: 10,
    exposure: 1.36
  },
  medium: {
    label: 'Trung bình',
    desc: 'Bật đổ bóng tĩnh nhẹ (256px), hiệu ứng bụi, vân tường/sàn và độ phân giải 1:1 (1.0x) cân bằng mượt mà.',
    maxDpr: 1.0,
    shadows: true,
    shadowType: THREE.PCFShadowMap,
    shadowSize: 256,
    dust: true,
    wallBump: 0.022,
    floorBump: 0.015,
    tvSkip: 6,
    exposure: 1.30
  },
  high: {
    label: 'Cao',
    desc: 'Đổ bóng mềm (512px PCFSoft), độ phân giải sắc nét (tối đa 1.5x), nổi khối sâu và ánh sáng giàu chi tiết.',
    maxDpr: 1.5,
    shadows: true,
    shadowType: THREE.PCFSoftShadowMap,
    shadowSize: 512,
    dust: true,
    wallBump: 0.030,
    floorBump: 0.020,
    tvSkip: 3,
    exposure: 1.24
  }
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      graphics: GFX_PRESETS[parsed.graphics] ? parsed.graphics : DEFAULT_SETTINGS.graphics,
      fpsLimit: [0, 30, 60, 120].includes(Number(parsed.fpsLimit)) ? Number(parsed.fpsLimit) : DEFAULT_SETTINGS.fpsLimit,
      showFps: Boolean(parsed.showFps),
      camSmooth: parsed.camSmooth !== undefined ? Boolean(parsed.camSmooth) : DEFAULT_SETTINGS.camSmooth,
      sensitivity: Math.max(0.5, Math.min(2.0, Number(parsed.sensitivity) || 1.0))
    };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (_) {}
}
```

---

### <a id="src-config-storyData-js"></a> Tập tin: `src/config/storyData.js` (309 dòng)

```javascript
export const TOTAL_LOOPS = 5;

export const LOOP_ANOMALY_REQ = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3 };

export const TIMELINE_STEPS = [
  { loop: 1, time: '02:14', short: 'Tiếng gõ ngoài cửa' },
  { loop: 2, time: '23:40?', short: 'Hộp cháo lạnh mốc' },
  { loop: 3, time: '14/11', short: 'Lịch trôi nhiều tuần' },
  { loop: 4, time: '02:08', short: 'Người đứng ngoài mưa' },
  { loop: 5, time: '02:14', short: 'Chốt khóa bên trong' }
];

export const MORAL_CHOICES = {
  1: {
    kicker: 'Trước cửa chính · 02:14',
    title: 'Tiếng gõ sau cánh cửa',
    prompt: 'Ba nhịp gõ trầm đục vang lên giữa màn mưa. Bàn tay bạn dừng lại trên chốt khóa đồng lạnh buốt.',
    a: {
      id: 'open',
      label: 'Tháo chốt, hé cửa nhìn ra ngoài',
      sub: 'Mở một khe nhỏ để xem ai đang đứng ngoài hành lang mưa.',
      chip: 'V1: Hé cửa nhìn',
      journal: 'Cuối Vòng 1: Bạn tháo chốt hé cửa nhìn ra. Ngoài hành lang chỉ còn màn mưa lạnh và một vệt nước loang sâu vào trong nhà.',
      reactSpeaker: 'Steve · Ngưỡng cửa',
      reactText: 'Cánh cửa vừa hé ra, gió mưa tạt thẳng vào mặt... Ngoài kia trống trơn, nhưng bóng dáng vừa khuất sao lại quen đến thế?'
    },
    b: {
      id: 'lock',
      label: 'Gạt chặt chốt khóa thêm một nấc',
      sub: 'Giữ kín cánh cửa, không mở cho ai vào lúc nửa đêm.',
      chip: 'V1: Chốt khóa chặt',
      journal: 'Cuối Vòng 1: Bạn gạt chặt chốt khóa. Tiếng gõ ngoài cửa dội mạnh thêm một nhịp rồi tắt lịm trong tiếng mưa.',
      reactSpeaker: 'Steve · Sau cánh cửa',
      reactText: 'Khóa chặt rồi... Nửa đêm thế này, tốt nhất cứ đóng kín cửa.'
    }
  },
  2: {
    kicker: 'Phòng khách · 02:14',
    title: 'Tờ hóa đơn 23:40',
    prompt: 'Hóa đơn ghi 2 phần cháo nóng lúc 23:40 ngày 14/11, nhưng hộp cháo trong tủ lạnh đã lạnh ngắt và mốc xanh. Trên tay bạn vẫn còn que diêm.',
    a: {
      id: 'keep',
      label: 'Gấp tờ hóa đơn cất vào túi áo',
      sub: 'Mang theo tờ giấy này dù mốc thời gian trên đó chẳng ăn khớp chút nào.',
      chip: 'V2: Giữ hóa đơn',
      journal: 'Cuối Vòng 2: Bạn gấp tờ hóa đơn ngày 14/11 cất vào túi áo. Nếu cháo đã mốc xanh, đêm 14/11 đã trôi qua từ rất lâu rồi.',
      reactSpeaker: 'Steve · Phòng khách',
      reactText: 'Mình giữ lại tờ giấy này... Có điều gì đó ở ngày 14/11 mà mình đã quên mất.'
    },
    b: {
      id: 'burn',
      label: 'Châm lửa đốt tờ hóa đơn',
      sub: 'Bỏ qua mảnh giấy cũ đó để đầu óc đỡ rối bời thêm.',
      chip: 'V2: Đốt hóa đơn',
      journal: 'Cuối Vòng 2: Bạn châm lửa đốt tờ hóa đơn. Mùi giấy cháy quyện với khói diêm làm căn nhà càng thêm ngột ngạt.',
      reactSpeaker: 'Steve · Khói giấy cháy',
      reactText: 'Chắc chỉ là tờ giấy cũ sót lại thôi... Đốt đi cho nhẹ đầu.'
    }
  },
  3: {
    kicker: 'Bàn phòng khách · 02:08',
    title: '4 cuộc gọi nhỡ từ Alice',
    prompt: 'Tờ lịch đã trôi qua nhiều tuần kể từ 14/11. Màn hình điện thoại sáng đỏ với 4 cuộc gọi nhỡ lúc 02:08 của Alice, còn điện thoại bàn ngoài kia lại sắp reo.',
    a: {
      id: 'answer',
      label: 'Tắt chế độ Im lặng, cầm máy chờ nghe',
      sub: 'Để âm lượng mở trở lại giữa căn phòng tĩnh lặng.',
      chip: 'V3: Tắt Im lặng',
      journal: 'Cuối Vòng 3: Bạn gạt tắt chế độ Im lặng trên điện thoại. Màn hình vẫn hiện 4 cuộc gọi nhỡ của Alice từ đêm 14/11.',
      reactSpeaker: 'Steve · Cầm điện thoại',
      reactText: 'Mình tắt Im lặng rồi, Alice... Làm ơn gọi lại đi.'
    },
    b: {
      id: 'poweroff',
      label: 'Tắt nguồn điện thoại, úp mặt xuống bàn',
      sub: 'Đặt chiếc máy trở lại mặt bàn gỗ để màn hình đỏ tắt hẳn.',
      chip: 'V3: Tắt nguồn máy',
      journal: 'Cuối Vòng 3: Bạn nhấn giữ nút nguồn tắt lịm màn hình đỏ và úp điện thoại xuống mặt bàn gỗ.',
      reactSpeaker: 'Steve · Trong bóng tối',
      reactText: 'Đừng sáng nữa... Mình không muốn nhìn thấy bốn dòng chữ đỏ đó nữa.'
    }
  },
  4: {
    kicker: 'Ngưỡng cửa chính · 02:09',
    title: 'Người đứng ngoài mưa',
    prompt: 'Tiếng gõ cửa suốt từ đầu không phải kẻ lạ. Sau cánh cửa gỗ là màn mưa đêm 14/11 — và bóng đen lẩn khuất trong căn nhà đang dừng lại ngay trước mặt bạn.',
    a: {
      id: 'face',
      label: 'Bước sát cửa, gọi tên Alice và mở chốt',
      sub: 'Đặt tay lên tay nắm cửa thêm một lần nữa.',
      chip: 'V4: Mở chốt gọi tên',
      journal: 'Cuối Vòng 4: Bạn bước sát cửa chính, gọi tên Alice và tháo chốt. Bóng đen lặng lẽ lùi vào màn mưa.',
      reactSpeaker: 'Steve · Trước cửa chính',
      reactText: 'Alice... Anh mở cửa đây. Lần này anh không khóa cửa nữa.'
    },
    b: {
      id: 'hide',
      label: 'Lùi vào bóng tối, bịt chặt hai tai',
      sub: 'Quay lưng lại cánh cửa để tiếng gõ không vọng vào nữa.',
      chip: 'V4: Lùi lại bịt tai',
      journal: 'Cuối Vòng 4: Bạn lùi vào góc tối bịt chặt hai tai. Tiếng gõ cửa biến thành tiếng cào gỗ dữ dội khắp căn nhà.',
      reactSpeaker: 'Steve · Run rẩy',
      reactText: 'Mình ngủ quên thôi mà... Đừng gõ nữa!'
    }
  }
};

export const LOOP_STORY = {
  1: {
    clockSub: 'Vòng 1/5 · 02:14 · Tiếng gõ ngoài cửa',
    objective: 'Kiểm tra 2 dấu vết trong nhà & tìm chìa khóa phòng làm việc',
    wakeSpeaker: 'Steve · 02:14',
    wakeText: '02:14 rồi mà Alice vẫn chưa về phòng... Ngoài cửa chính vừa có tiếng gõ rất khẽ. Bấm [F] quẹt diêm, kiểm tra 2 chỗ lạ trong nhà và tìm chìa khóa phòng làm việc xem sao.',
    clueTitle: 'Tờ lịch bàn (Ghi chú khuya)',
    clueSpeaker: 'Mẩu giấy trên bàn',
    clueText: '“Trời mưa khuya lắm rồi. Nếu có tiếng gõ cửa lúc nửa đêm, đừng vội mở — kiểm tra kỹ chốt khóa trước đã.”',
    journal: 'Vòng 1 (02:14): Căn nhà vắng lặng khác thường. Steve nghĩ Alice chỉ ra ngoài mua đồ ăn khuya và cảnh giác với tiếng gõ cửa lạ ngoài hành lang.',
    doorLockedText: 'Chốt cửa vẫn đang cài. Kiểm tra đủ 2 dấu vết trong nhà và xem giấy trên bàn làm việc trước.'
  },
  2: {
    clockSub: 'Vòng 2/5 · Mất điện · Mùi ẩm mốc',
    objective: 'Vào Nhà bếp bật Cầu dao điện & kiểm tra 2 dấu vết (vũng nước, tủ lạnh, giấy bếp)',
    wakeSpeaker: 'Steve · Trong bóng tối',
    wakeText: 'Lại 02:14... Cầu dao vừa sập tối om, dưới khe cửa chính có nước mưa thấm vào. Ai đó lại gõ cửa! Nhìn ánh đèn đỏ phía Nhà bếp bên trái phòng khách để gạt cầu dao trước.',
    clueTitle: 'Hóa đơn quán đêm 23:40',
    clueSpeaker: 'Hóa đơn trên bàn làm việc',
    clueText: '“14/11 · 23:40 · 2 phần cháo nóng. Steve, trời bắt đầu mưa rồi, em ghé mua cháo về cho anh ăn.” — Khoan đã, nếu mới mua tối nay, sao hộp cháo trong tủ lạnh đã mốc xanh?',
    journal: 'Vòng 2: Hóa đơn ghi 23:40 ngày 14/11 với 2 phần cháo nóng, nhưng hộp cháo trong tủ lạnh đã nguội lạnh và lên mốc xanh từ nhiều ngày trước.',
    doorLockedText: 'Tay nắm cửa lạnh buốt. Hãy vào Nhà bếp bật cầu dao, kiểm tra đủ 2 dấu vết và đọc tờ hóa đơn trên bàn làm việc.'
  },
  3: {
    clockSub: 'Vòng 3/5 · 14/11 · Những tuần lễ biến mất',
    objective: 'Kiểm tra 3 dấu vết (điện thoại sáng đỏ, đồng hồ chạy ngược, khung ảnh) → phòng làm việc',
    wakeSpeaker: 'Steve · Ký ức rạn nứt',
    wakeText: 'Đồng hồ đầu giường đang chạy ngược! Cháo đã mốc, lịch treo tường bị xé nham nhở... Không phải tối nay. Màn hình điện thoại ngoài phòng khách đang phát sáng đỏ rực.',
    clueTitle: 'Nhật ký cuộc gọi 02:08 & Tờ lịch xé dở',
    clueSpeaker: 'Hồ sơ trên bàn làm việc',
    clueText: '“14/11 · 02:08 — 4 cuộc gọi nhỡ liên tiếp từ Alice (Máy bật Im lặng).” Bên cạnh là tờ lịch đã bị gạch chéo suốt 3 tuần kể từ ngày 14/11.',
    journal: 'Vòng 3 (Mâu thuẫn vỡ lẽ): Đêm 14/11 đã trôi qua nhiều tuần. Steve mới nhận ra người gọi liên tiếp lúc 02:08 không phải ai xa lạ — mà là Alice.',
    doorLockedText: 'Cửa chính chưa thể mở. Hãy kiểm tra đủ 3 dấu vết (điện thoại, đồng hồ, khung ảnh) rồi vào phòng làm việc.'
  },
  4: {
    clockSub: 'Vòng 4/5 · 02:09 · Người đứng ngoài mưa',
    objective: 'Kiểm tra 3 dấu vết (tin nhắn thoại 02:09, khung ảnh vỡ, điện thoại bàn) → phòng làm việc',
    wakeSpeaker: 'Steve · Nhận ra sự thật',
    wakeText: 'Chiếc gối của Alice bên cạnh biến mất rồi... Tiếng gõ cửa suốt từ nãy không phải kẻ lạ. Bóng Đen lẩn khuất quanh đây là ký ức về đêm mình đã chốt cửa bỏ mặc cô ấy.',
    clueTitle: 'Bản chép tin nhắn thoại 02:09',
    clueSpeaker: 'Tin nhắn thoại của Alice',
    clueText: '“02:09 — Steve, chắc anh ngủ say rồi. Em gõ cửa mãi không thấy anh ra, điện thoại cũng không bắt máy... Không sao đâu, em tự đi bộ ra đầu hẻm bắt xe nhé. Mai mình nói tiếp.”',
    journal: 'Vòng 4 (02:09): Tiếng gõ cửa đáng sợ hóa ra là Alice đứng dưới mưa cầu cứu. Sau 4 cuộc gọi nhỡ và cánh cửa chốt trong, cô ấy để lại tin nhắn thoại rồi quay lưng đi vào con hẻm tối.',
    doorLockedText: 'Chưa thể rời đi. Hãy kiểm tra đủ 3 dấu vết và đọc bản chép tin nhắn thoại trên bàn làm việc.'
  },
  5: {
    clockSub: 'Vòng 5/5 · 02:14 · Đối diện chốt khóa',
    objective: 'Kiểm tra 3 dấu vết cuối → mở khóa mã 4 số (0214 / 1411) trên bàn làm việc',
    wakeSpeaker: 'Steve · 02:14',
    wakeText: 'Ngoài cửa sổ ánh đèn xanh–đỏ của xe cấp cứu đang chớp liên hồi... Bó hoa cúc trắng đã nằm dưới khung ảnh vỡ. Đã đến lúc mở hộp hồ sơ trên bàn làm việc và đối diện đêm 14/11.',
    clueTitle: 'Giấy báo tử của Alice (02:14)',
    clueSpeaker: 'Sự thật không thể chối bỏ',
    clueText: '“02:14 sáng 14/11 — Alice đã không qua khỏi sau vụ tai nạn ngay đầu con hẻm mưa lớn.” Chốt khóa chưa từng cài từ bên ngoài — chính mình đã tự nhốt mình trong căn nhà này.',
    journal: 'Vòng 5 (02:14): Steve mở hộp hồ sơ, đọc giấy báo tử của Alice và đối diện với Bóng Đen tội lỗi của chính mình trước cánh cửa dẫn ra bình minh.',
    doorLockedText: 'Cần kiểm tra đủ 3 dấu vết cuối và giải khóa mã 4 số trên bàn làm việc trước khi mở cửa chính.'
  },
  anomalyClock: {
    1: { speaker: 'Đồng hồ đầu giường', text: 'Mặt LED cứ giật giữa 02:13 và 02:14. Chắc đồng hồ sắp hết pin rồi...' },
    2: { speaker: 'Đồng hồ đầu giường', text: 'Cả nhà cúp điện tối om, vậy mà mặt số 02:14 vẫn sáng đỏ rực một cách phi lý.' },
    3: { speaker: 'Đồng hồ chạy ngược', text: 'Đồng hồ đang chạy ngược từng phút một — như thể chính căn nhà đang cố quay lại trước lúc 02:08.' },
    4: { speaker: 'Đồng hồ báo lỗi', text: 'Màn hình nhấp nháy giữa “ERR!” và “02:14” — đúng thời khắc chiếc điện thoại bàn réo lên.' },
    5: { speaker: 'Đồng hồ đầu giường · Gợi ý mã', text: 'Bốn chữ số 02:14 sáng rõ trong ánh đèn cấp cứu — cũng là mật mã hộp hồ sơ trong phòng làm việc.' }
  },
  anomalyChair: {
    1: { speaker: 'Ghế ăn bị xô lệch', text: 'Một chiếc ghế ăn bị đẩy lùi vội vã... Chắc lúc tối mình đứng dậy vội quá nên quên đẩy vào.' },
    2: { speaker: 'Ghế ăn dịch chuyển', text: 'Chiếc ghế tự dịch sát cửa phòng ngủ, như có ai đang đứng ngoài hành lang chờ được mở cửa.' },
    3: { speaker: 'Ghế trước TV nhiễu', text: 'Chiếc ghế xoay thẳng về phía màn hình TV nhiễu hạt, mặt ghế phủ một lớp bụi mỏng như đã nhiều tuần không ai ngồi.' },
    4: { speaker: 'Ghế chắn trước cửa', text: 'Chiếc ghế bị kê chặn ngay sau Cửa chính — giống hệt cách Steve đã cố ngăn không cho ai bước vào đêm đó.' },
    5: { speaker: 'Ghế đổ giữa phòng', text: 'Chiếc ghế nằm đổ nghiêng sang một bên, mở lối thẳng ra cánh cửa chính.' }
  },
  anomalyPortrait: {
    1: { speaker: 'Khung ảnh Steve & Alice', text: 'Bức ảnh chụp chung của hai đứa bị treo nghiêng hẳn sang một bên. Gió lùa qua cửa sổ chăng?' },
    2: { speaker: 'Khung ảnh bị cào xước', text: 'Gương mặt trong bức ảnh có những vết cào mờ... nhưng vết cào lại nằm ở phía bên trong mặt kính.' },
    3: { speaker: 'Khung ảnh treo ngược', text: 'Bức ảnh bị lật ngược 180 độ! Lớp bụi dày đóng trên viền khung chứng tỏ chẳng ai lau dọn nhà suốt nhiều tuần.' },
    4: { speaker: 'Khung ảnh rơi vỡ', text: 'Khung ảnh đôi rơi vỡ tan trên sàn, mặt kính nứt cắt ngang giữa Steve và Alice.' },
    5: { speaker: 'Khung ảnh vỡ & Hoa trắng', text: 'Bó hoa cúc trắng lặng lẽ nằm bên khung ảnh vỡ. Đằng sau mặt gỗ hằn vết khắc “14/11”.' }
  },
  anomalyScrawl: {
    2: { speaker: 'Chữ đỏ trên tường', text: 'Trên tường phòng khách hiện dòng chữ mờ: “SAO ANH KHÔNG MỞ? Ngoài này lạnh quá...”' },
    3: { speaker: 'Chữ đỏ trên tường', text: 'Dòng chữ đổi thành: “ĐÃ 3 TUẦN TỪ 14/11 — KHÔNG PHẢI KẺ LẠ ĐÂU”.' },
    4: { speaker: 'Chữ đỏ trên tường', text: 'Nét chữ cào sâu vào vữa: “NGƯỜI GÕ CỬA LÀ ALICE — CHÍNH ANH ĐÃ CHỐT KHÓA”.' },
    5: { speaker: 'Chữ đỏ trên tường', text: 'Dòng chữ cuối cùng: “MỞ CHỐT KHÓA RA · BƯỚC KHỎI ĐÊM 14/11”.' }
  },
  brokenMug: {
    1: { speaker: 'Chiếc cốc vỡ trên sàn', text: 'Mảnh sứ vỡ vương vãi... Kỳ lạ, nước trà quanh đó đã khô cong thành vệt ố nâu từ lâu chứ không phải mới đổ.' },
    2: { speaker: 'Mảnh cốc vỡ khô cong', text: 'Mình cứ nghĩ cốc mới vỡ tối nay, nhưng vết trà đã đóng cặn cứng ngắt. Cuộc cãi vã đó xảy ra từ bao giờ rồi?' }
  },
  rainPuddle: {
    2: { speaker: 'Vũng nước mưa dưới khe cửa', text: 'Nước mưa thấm tràn qua khe cửa chính... Bên ngoài thật sự có ai đó vừa đứng rất lâu dưới mưa.' },
    3: { speaker: 'Vũng nước mưa lạnh buốt', text: 'Dấu giày ướt dừng ngay trước bậc cửa rồi quay ngược trở ra phía con hẻm tối...' }
  },
  windowPass: {
    speaker: 'Ngoài cửa sổ',
    text: 'Vừa có một bóng người ôm áo khoác lướt ngang qua màn mưa ngoài cửa sổ... Là kẻ lạ hay ai?'
  },
  wardrobe1: {
    speaker: 'Tủ quần áo',
    text: 'Áo khoác dày của Alice vẫn treo ở đây... Trời mưa lạnh thế này mà cô ấy lại quên mang áo khoác sao?'
  },
  wardrobe2: {
    speaker: 'Tủ quần áo trống trơn',
    text: 'Chiếc áo khoác biến mất rồi, chỉ còn mùi nước mưa lạnh ngắt phả ra khi cánh tủ sập mạnh!'
  },
  wardrobe3: {
    speaker: 'Vách tủ quần áo',
    text: 'Bên trong vách gỗ hằn vết móng tay cào nguệch ngoạc: “ALICE · 14/11 · 02:14”.'
  },
  mirror1: {
    speaker: 'Gương phòng ngủ',
    text: 'Mắt mình thâm quầng rã rời như đã thức trắng cả tháng trời... Đằng sau vai thoáng thấy một bóng đen đứng im.'
  },
  mirror2: {
    speaker: 'Gương phòng ngủ nứt toác',
    text: 'Mặt gương tự nứt toác! Bóng người trong gương không phải kẻ lạ — mà là chính Steve đang đứng quay lưng với cánh cửa.'
  },
  portraitFall: {
    speaker: 'Tiếng kính vỡ',
    text: 'Khung ảnh chụp chung trên tường phòng khách vừa rơi thẳng xuống sàn vỡ tan!'
  },
  atticStep: {
    speaker: 'Trên trần nhà',
    text: 'Tiếng bước chân đi đi lại lại chậm rãi, đều đặn như ai đó đang sốt ruột chờ được mở cửa.'
  },
  foxOutside: {
    speaker: 'Ngoài con hẻm',
    text: 'Tiếng gió rít và âm thanh khô khốc vọng về từ phía đầu hẻm tối mịt...'
  },
  phoneCall: {
    speaker: 'Điện thoại bàn · Tiếng nhiễu',
    text: '“...Steve... sao anh không mở cửa... em lạnh quá... mưa to lắm rồi... làm ơn...” *tút... tút...*'
  },
  loop3Chase: {
    speaker: 'Steve · Đối diện',
    text: 'Bóng Đen đó không phải quái vật... Nó là tiếng gõ cửa mình đã khóa ngoài đêm 14/11. Mở cửa ra đi!'
  },
  loop3Echo: {
    speaker: 'Tiếng gõ & lời thì thầm',
    text: '“Steve... anh định tự nhốt mình sau cánh cửa đêm 14/11 này đến bao giờ nữa?”'
  },
  kitchenFaucet1: {
    speaker: 'Vòi nước nhà bếp',
    text: 'Vòi nước nhỏ giọt tí tách bên cạnh hai chiếc cốc đã phủ bụi mỏng trong bồn rửa.'
  },
  kitchenFaucet2: {
    speaker: 'Vòi nước tự mở!',
    text: 'Dòng nước lạnh buốt chảy tràn bồn rửa, ồn ào như cơn mưa xối xả ngoài đầu hẻm đêm đó.'
  },
  fridge1: {
    speaker: 'Tủ lạnh hở sáng',
    text: 'Trong tủ lạnh có hai hộp cháo. Mình cứ nghĩ Alice mới mua về... nhưng sờ vào đã lạnh ngắt, mép hộp bắt đầu đóng váng mốc!'
  },
  fridge2: {
    speaker: 'Tủ lạnh lạnh mốc',
    text: 'Hộp cháo đã mốc xanh đóng đá từ nhiều tuần trước! Không thể nào là tối nay được...'
  },
  fridge3: {
    speaker: 'Mẩu giấy đóng băng',
    text: 'Trên khay đá chỉ còn mẩu giấy nhàu nát cứng đờ: “Đừng giả vờ chờ nữa, Steve.”'
  },
  kitchenNote1: {
    title: 'Giấy nhắn trên quầy bếp',
    speaker: 'Giấy nhắn của Alice',
    text: '“Steve, em mua cháo để trong tủ lạnh, anh nhớ hâm lại ăn nha.” — Nhưng góc giấy đã ố vàng và quăn mép.',
    journal: 'Nhà bếp (Vòng 1): Tờ giấy nhắn của Alice trông bình thường, chỉ lạ là mép giấy đã ố vàng như để từ nhiều tuần trước.'
  },
  kitchenNote2: {
    title: 'Giấy nhắn nhòe nước mưa',
    speaker: 'Giấy nhắn trên quầy bếp',
    text: '“Trời mưa to quá, em đứng trước cửa hơi lâu rồi. Đừng khóa cửa ngủ quên nhé Steve.”',
    journal: 'Nhà bếp (Vòng 2–3): Mực trên tờ giấy nhắn nhòe nước mưa lạnh, nhắc về việc cửa bị khóa từ bên trong.'
  },
  kitchenNote3: {
    title: 'Mặt sau tờ giấy nhắn của Steve',
    speaker: 'Nét chữ nguệch ngoạc của Steve',
    text: '“Mình không hề ngủ quên. Lúc đó mình còn thức, nghe rõ tiếng gõ cửa của Alice — nhưng mình vẫn cố tình chốt khóa.”',
    journal: 'Nhà bếp (Vòng 4–5): Mặt sau tờ giấy phơi bày sự thật mà Steve đã tự lừa mình suốt nhiều tuần.'
  },
  bathFaucet1: {
    speaker: 'Vòi nước phòng tắm',
    text: 'Vòi rửa mặt rỉ từng giọt chậm rãi trong căn phòng lát gạch lạnh buốt.'
  },
  bathFaucet2: {
    speaker: 'Vòi nước tự chảy!',
    text: 'Hơi nước bốc mờ phủ kín mặt gương phòng tắm phía trên...'
  },
  bathMirror1: {
    speaker: 'Gương phòng tắm',
    text: 'Mặt gương phủ lớp hơi sương mỏng. Trông mình tiều tụy như người đã nhốt mình trong nhà nhiều tuần liền.'
  },
  bathMirror2: {
    speaker: 'Gương phòng tắm mờ sương!',
    text: 'Trên lớp hơi nước hiện rõ dòng số “02:14” như có ngón tay lạnh cóng vừa viết từ phía bên kia!'
  },
  bathMirror3: {
    speaker: 'Gương phòng tắm nứt dọc',
    text: 'Mặt kính nứt toác cùng dòng chữ: “NGƯỜI NGOÀI CỬA LÀ ALICE — ĐỪNG TRỐN NỮA”.'
  },
  endingKicker: '05:48 Sáng · Ngày 15 Tháng 11',
  endingTitle: 'Bình Minh 15/11',
  endingBody: 'Steve mở khóa bước qua cánh cửa chính vào ánh nắng sớm. Alice thật sự không còn nữa, nhưng lần này Steve đã ngừng tự lừa dối mình để đối diện sự thật và bước tiếp.'
};
```

---

### <a id="src-game-endings-js"></a> Tập tin: `src/game/endings.js` (411 dòng)

```javascript
import { TOTAL_LOOPS, LOOP_STORY } from '../config/storyData.js';
import { clearSavedRun } from './saveManager.js';

const UNLOCKED_ENDINGS_KEY = 'dem_khong_dut_unlocked_endings_v1';

export function loadUnlockedEndings() {
  try {
    const raw = localStorage.getItem(UNLOCKED_ENDINGS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((t) => ['true', 'normal', 'bad'].includes(t)) : [];
  } catch (_) {
    return [];
  }
}

export function unlockEnding(type) {
  if (!['true', 'normal', 'bad'].includes(type)) return loadUnlockedEndings();
  const list = loadUnlockedEndings();
  if (!list.includes(type)) {
    list.push(type);
    try {
      localStorage.setItem(UNLOCKED_ENDINGS_KEY, JSON.stringify(list));
    } catch (_) {}
  }
  return list;
}

export const ALLEY_VOICES = [
  { z: -16.5, speaker: 'Ký ức', text: '“Đoạn hẻm này tối quá… đi một mình em hơi sợ.” — “Vậy lần sau cứ gọi anh. Anh ra đón em.”' },
  { z: -26.5, speaker: 'Ý nghĩ', text: 'Cô ấy đã gọi, đúng như mình từng nói. Vậy mà mình không bắt máy. Rồi tự giam mình trong đêm đó suốt bao lâu nay.' },
  { z: -36.5, speaker: 'Ý nghĩ', text: 'Nhưng dù mình có kẹt lại trong đêm này mãi, cô ấy cũng không quay về được.' }
];

export const VOICEMAIL_LINE = '“...anh bảo cứ gọi mà... sao anh không nghe máy... (cười khẽ) Em đùa thôi. Chắc anh ngủ say rồi hả. Không sao đâu, lần này em tự đi được. Chuyện lúc tối, mai mình nói tiếp nha. Anh ngủ ngon.”';
export const FINALE_LINE_5 = 'Mình đã tệ với cô ấy, điều đó không đổi. Nhưng cô ấy vẫn gọi. Lần này, mình nghe hết rồi.';
export const FINALE_LINE_6 = 'Anh sẽ không quên em đâu. Kể cả những lỗi của anh. Chỉ là… từ hôm nay, anh sẽ sống tiếp.';

export const ENDINGS_DATA = {
  true: {
    cls: '',
    badge: 'Kết thúc Thật · 1/3',
    title: 'Bình Minh 15/11',
    kicker: '15 tháng 11 · 05:48',
    body: '“Không có kẻ lạ nào ngoài cửa cả — chỉ có em đứng dưới mưa và nỗi sợ của chính anh. Hôm nay, anh mở chốt khóa và bước ra khỏi đêm 14/11.”',
    phoneTime: '05:48',
    phoneDate: '15/11',
    phoneIcon: '✓',
    phoneTitle: 'Tin nhắn thoại của Alice · 02:09 · Đã nghe & lưu',
    phoneBar: '100%'
  },
  normal: {
    cls: 'ending-normal',
    badge: 'Kết thúc Thường · 2/3',
    title: 'Sáng Sớm Lạnh Lẽo',
    kicker: '15 tháng 11 · 05:12',
    body: '“Tôi bước ra khỏi căn nhà khi trời vừa tảng sáng. Tôi biết người gõ cửa đêm đó là Alice, nhưng trong lòng vẫn còn những mảnh ký ức chưa đủ can đảm đối diện.”',
    phoneTime: '05:12',
    phoneDate: '15/11',
    phoneIcon: '●',
    phoneTitle: '1 tin nhắn thoại nghe dở · Alice (02:09)',
    phoneBar: '36%'
  },
  bad: {
    cls: 'ending-bad',
    badge: 'Kết thúc Xấu · 3/3',
    title: '02:14',
    kicker: '14 tháng 11 · 02:14',
    body: '“Tôi lại mở mắt trên giường giữa tiếng mưa. Tôi vẫn tự nhủ ngoài cửa là kẻ lạ — và bàn tay tôi lại gạt chặt chốt khóa thêm một lần nữa.”',
    phoneTime: '02:14',
    phoneDate: '14/11',
    phoneIcon: '✕',
    phoneTitle: '4 cuộc gọi nhỡ · Alice · Chế độ Im lặng',
    phoneBar: '0%'
  }
};

let finaleTimers = [];
export function clearFinaleTimers() {
  finaleTimers.forEach((id) => clearTimeout(id));
  finaleTimers = [];
}

let introTimers = [];
export function clearIntroTimers() {
  introTimers.forEach((id) => clearTimeout(id));
  introTimers = [];
}

export function advanceVoicemailSequence(ctx) {
  const { shadowEvent, subtitleBox, audio, showSubtitle, lightWhiteout, triggerTrueEnding } = ctx;
  if (!shadowEvent.voicemailHold || shadowEvent.voicemailAdvanced) return;
  shadowEvent.voicemailHold = false;
  shadowEvent.voicemailAdvanced = true;
  shadowEvent.whiteoutDone = true;
  subtitleBox.classList.remove('voicemail-hold');

  shadowEvent.melodyStarted = true;
  audio.playEndingMelody();

  showSubtitle('Ý nghĩ', FINALE_LINE_5, 6400, false, false, true);
  lightWhiteout.style.transition = 'opacity 6.2s ease';
  lightWhiteout.style.opacity = '0.88';

  finaleTimers.push(setTimeout(() => {
    if (ctx.state.ended) return;
    showSubtitle('Ý nghĩ', FINALE_LINE_6, 6800, false, false, true);
    lightWhiteout.style.transition = 'opacity 5.0s ease';
    lightWhiteout.style.opacity = '1';
  }, 6600));

  finaleTimers.push(setTimeout(() => {
    audio.stopSoftRain();
    triggerTrueEnding();
  }, 13600));
}

export function showEndingScreen(endingType = 'true', ctx) {
  const {
    state,
    audio,
    camera,
    panicOverlay,
    chaseBanner,
    subtitleBox,
    endingScreen,
    endingBadge,
    endingTitle,
    endingKicker,
    endingBody,
    endingPhone,
    endingPhoneTime,
    endingPhoneDate,
    endingPhoneIcon,
    endingPhoneTitle,
    endingPhoneBar,
    endingChoicesSummary,
    btnRetryLoop,
    clearKeys,
    clearInteractUI
  } = ctx;

  const data = ENDINGS_DATA[endingType] || ENDINGS_DATA.true;
  clearFinaleTimers();
  state.ended = true;
  clearKeys();

  panicOverlay.classList.remove('active');
  document.body.classList.remove('in-panic');
  camera.fov = 66; camera.updateProjectionMatrix();

  chaseBanner.classList.remove('visible');
  subtitleBox.classList.remove('visible');
  subtitleBox.classList.remove('voicemail-hold');
  clearInteractUI();
  if (document.pointerLockElement) document.exitPointerLock();

  endingScreen.classList.remove('ending-normal', 'ending-bad');
  if (data.cls) endingScreen.classList.add(data.cls);

  if (endingBadge) endingBadge.textContent = data.badge;
  if (endingTitle) endingTitle.textContent = data.title;
  if (endingKicker) endingKicker.textContent = data.kicker;
  if (endingBody) endingBody.textContent = data.body;
  if (endingPhoneTime) endingPhoneTime.textContent = data.phoneTime;
  if (endingPhoneDate) endingPhoneDate.textContent = data.phoneDate;
  if (endingPhoneIcon) endingPhoneIcon.textContent = data.phoneIcon;
  if (endingPhoneTitle) endingPhoneTitle.textContent = data.phoneTitle;
  if (endingPhoneBar) endingPhoneBar.style.width = data.phoneBar;

  if (endingChoicesSummary) {
    endingChoicesSummary.innerHTML = '';
    if (state.choices.length > 0) {
      state.choices.forEach((c) => {
        const span = document.createElement('span');
        span.className = 'choice-chip';
        span.textContent = c.chip;
        endingChoicesSummary.appendChild(span);
      });
    }
  }

  const unlocked = unlockEnding(endingType);
  const isDev = Boolean(import.meta.env && import.meta.env.DEV);
  const switchRow = document.querySelector('.ending-switch-row');
  if (switchRow) {
    switchRow.style.display = isDev || unlocked.length > 1 ? '' : 'none';
  }
  document.querySelectorAll('.ending-switch-btn').forEach((btn) => {
    const btnType = btn.getAttribute('data-ending');
    const visible = isDev || unlocked.includes(btnType);
    btn.style.display = visible ? '' : 'none';
    btn.classList.toggle('active', btnType === endingType);
  });

  if (btnRetryLoop) {
    const targetLoop = Math.max(1, Math.min(TOTAL_LOOPS, state.loop || TOTAL_LOOPS));
    btnRetryLoop.textContent = `Chơi lại ngay Vòng ${targetLoop}`;
    btnRetryLoop.classList.toggle('hidden', endingType !== 'bad');
  }

  if (endingType === 'bad') {
    audio.stopEndingMelody();
    audio.playLoopReset();
  } else {
    audio.playEndingMelody();
  }

  if (endingPhone) endingPhone.classList.remove('show');
  endingScreen.classList.remove('hidden');
  finaleTimers.push(setTimeout(() => {
    if (state.ended && endingPhone) endingPhone.classList.add('show');
  }, 750));
}

export function triggerTrueEnding(forceType = null, ctx) {
  const { state } = ctx;
  if (state.ended && !forceType) return;
  let type = forceType;
  if (!type) {
    if (state.courageScore >= 3) type = 'true';
    else if (state.courageScore >= 1) type = 'normal';
    else type = 'bad';
  }
  showEndingScreen(type, ctx);
}

export function beginLoop1AfterIntro(ctx) {
  const { state, introScreen, introLine1, introLine2, introLine3, setupLoopEnvironment, showSubtitle } = ctx;
  if (!state.inIntro) return;
  clearIntroTimers();
  state.inIntro = false;
  introScreen.classList.remove('active');
  introLine1.classList.remove('show');
  introLine2.classList.remove('show');
  introLine3.classList.remove('show');
  state.running = true;
  document.body.classList.remove('pre-start');
  setupLoopEnvironment(1, ctx);
  setTimeout(() => {
    if (state.running && state.loop === 1 && !state.ended) {
      showSubtitle(LOOP_STORY[1].wakeSpeaker, LOOP_STORY[1].wakeText, 7200);
    }
  }, 3200);
}

export function startNewGame(withIntro = true, ctx) {
  const {
    state,
    audio,
    candles,
    scene,
    lightWhiteout,
    startScreen,
    endingScreen,
    journalScreen,
    settingsScreen,
    keypadScreen,
    choiceScreen,
    introScreen,
    introLine1,
    introLine2,
    introLine3,
    renderJournal,
    setupLoopEnvironment,
    showSubtitle
  } = ctx;

  clearIntroTimers();
  clearFinaleTimers();
  lightWhiteout.style.transition = 'opacity 0.12s linear';
  audio.stopEndingMelody();

  state.ended = false;
  state.paused = false;
  state.inIntro = false;
  state.matchesLeft = 10;
  state.journalNotes = [];
  state.choices = [];
  state.courageScore = 0;
  state.denialScore = 0;
  state.pendingChoiceLoop = 0;
  scene.fog.density = 0.105;

  candles.forEach(c => { c.lit = false; c.flame.visible = false; c.light.intensity = 0; });
  renderJournal();

  startScreen.classList.add('hidden');
  endingScreen.classList.add('hidden');
  journalScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  keypadScreen.classList.add('hidden');
  choiceScreen.classList.add('hidden');

  if (!withIntro) {
    state.running = true;
    document.body.classList.remove('pre-start');
    setupLoopEnvironment(1, ctx);
    setTimeout(() => {
      if (state.running && state.loop === 1 && !state.ended) {
        showSubtitle(LOOP_STORY[1].wakeSpeaker, LOOP_STORY[1].wakeText, 7200);
      }
    }, 2800);
    return;
  }

  state.running = false;
  state.inIntro = true;
  document.body.classList.add('pre-start');
  introLine1.classList.remove('show');
  introLine2.classList.remove('show');
  introLine3.classList.remove('show');
  introScreen.classList.add('active');

  introTimers.push(setTimeout(() => introLine1.classList.add('show'), 450));
  introTimers.push(setTimeout(() => introLine2.classList.add('show'), 2200));
  introTimers.push(setTimeout(() => introLine3.classList.add('show'), 4300));
  introTimers.push(setTimeout(() => beginLoop1AfterIntro(ctx), 6800));
}

export function retryCurrentLoop(ctx) {
  const {
    state,
    audio,
    lightWhiteout,
    startScreen,
    endingScreen,
    journalScreen,
    settingsScreen,
    keypadScreen,
    choiceScreen,
    renderJournal,
    setupLoopEnvironment,
    showSubtitle
  } = ctx;

  const targetLoop = Math.max(1, Math.min(TOTAL_LOOPS, state.loop || TOTAL_LOOPS));
  clearIntroTimers();
  clearFinaleTimers();
  if (ctx.timers) ctx.timers.clearAll();
  audio.init();
  audio.stopEndingMelody();
  lightWhiteout.style.transition = 'opacity 0.12s linear';
  lightWhiteout.style.opacity = '0';
  state.ended = false;
  state.paused = false;
  state.inIntro = false;
  state.running = true;
  state.matchesLeft = Math.max(state.matchesLeft, 4);

  const prefix = `Vòng ${targetLoop} —`;
  state.journalNotes = state.journalNotes.filter((n) => !n.title.startsWith(prefix));
  renderJournal();

  document.body.classList.remove('pre-start');
  startScreen.classList.add('hidden');
  endingScreen.classList.add('hidden');
  journalScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  keypadScreen.classList.add('hidden');
  choiceScreen.classList.add('hidden');

  setupLoopEnvironment(targetLoop, ctx);
  showSubtitle(LOOP_STORY[targetLoop].wakeSpeaker, LOOP_STORY[targetLoop].wakeText, 6800);
}

export function startQuickEndingTest(ctx) {
  const {
    state,
    audio,
    startScreen,
    introScreen,
    journalScreen,
    settingsScreen,
    keypadScreen,
    choiceScreen,
    foleyPanel,
    btnFoley,
    shadow,
    lights,
    dangerPulse,
    hudCache
  } = ctx;

  clearIntroTimers();
  clearFinaleTimers();
  if (ctx.timers) ctx.timers.clearAll();
  audio.init();
  audio.stopEndingMelody();
  state.ended = false;
  state.paused = false;
  state.inIntro = false;
  state.running = true;

  document.body.classList.remove('pre-start');
  startScreen.classList.add('hidden');
  introScreen.classList.remove('active');
  journalScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  keypadScreen.classList.add('hidden');
  choiceScreen.classList.add('hidden');
  foleyPanel.classList.add('hidden');
  btnFoley.classList.remove('active');
  shadow.group.visible = false;
  lights.emergencyRedLight.intensity = 0;
  dangerPulse.style.opacity = '0';
  hudCache.dangerOp = '0.00';

  triggerTrueEnding('true', ctx);
}
```

---

### <a id="src-game-horrorDirector-js"></a> Tập tin: `src/game/horrorDirector.js` (479 dòng)

```javascript
import * as THREE from 'three';
import { LOOP_STORY } from '../config/storyData.js';
import { ALLEY_VOICES, VOICEMAIL_LINE } from './endings.js';

export const PEEK_SPOTS = [
  new THREE.Vector3(-4.45, 0, -2.2),  // Khe cửa Nhà bếp
  new THREE.Vector3(3.95, 0, 0.45),   // Khe cửa Phòng tắm
  new THREE.Vector3(0.15, 0, -8.8),   // Cuối phòng khách gần cửa chính
  new THREE.Vector3(3.9, 0, -4.45)    // Khung cửa Phòng làm việc
];

const _tmpVec = new THREE.Vector3();
const _camDir = new THREE.Vector3();

export function computeStereoPan(worldTargetPos, playerPos, playerRight) {
  _tmpVec.subVectors(worldTargetPos, playerPos);
  _tmpVec.y = 0;
  const len = _tmpVec.length();
  if (len < 0.001) return 0;
  _tmpVec.divideScalar(len);
  return Math.max(-0.92, Math.min(0.92, _tmpVec.dot(playerRight)));
}

export function createShadowEventState() {
  return {
    mode: 'hidden',
    timer: 0,
    triggeredBehind: false,
    echoStepTimer: 0,
    windowPassed: false,
    chaseStepAccum: 0,
    portraitFell: false,
    atticTimer: 9.0,
    foxTimer: 16.0,
    alleyFoxCried: false,
    alleyVoiceStep: 0,
    dogBark1: false,
    dogBark2: false,
    whiteoutDone: false,
    melodyStarted: false,
    shadowStopped: false,
    voicemailHold: false,
    voicemailAdvanced: false,
    peekCooldown: 12.0,
    peekVanishTimer: 0,
    peekActive: false,
    doorCreakCooldown: 16.0,
    blowOutCooldown: 18.0,
    blowOutsInLoop: 0,
    spatialWhisperCooldown: 14.0,
    distractTimer: 0,
    distractPos: new THREE.Vector3()
  };
}

export function updateShadowEvents(dt, tSec, isMoving, ctx) {
  const {
    state,
    camera,
    shadow,
    shadowEvent,
    audio,
    doors,
    portraitGroup,
    portraitAnomalyObj,
    livingWindowMoon,
    emergencyRedLight,
    alleyLights,
    dangerPulse,
    chaseBanner,
    lightWhiteout,
    objectiveText,
    hudCache,
    showSubtitle,
    triggerTrueEnding,
    playerRight
  } = ctx;

  camera.getWorldDirection(_camDir);
  let tension = 0;

  // Loop 2: Family portrait crashes off wall
  if (state.loop === 2 && !shadowEvent.portraitFell && state.pos.z < -4.2) {
    shadowEvent.portraitFell = true;
    portraitGroup.position.set(-3.45, 0.08, -3.4);
    portraitGroup.rotation.set(0, 0.25, -Math.PI / 2);
    portraitAnomalyObj.worldPos.set(-3.45, 0.35, -3.4);
    audio.triggerDeadSilence(1400);
    audio.playPortraitFall();
    state.shakeTime = 0.35;
    showSubtitle(LOOP_STORY.portraitFall.speaker, LOOP_STORY.portraitFall.text, 4800);
  }

  // Loop 2 & 3: Attic footsteps + distant fox cry
  if (state.loop >= 2 && shadowEvent.mode !== 'loop3_chase') {
    shadowEvent.atticTimer -= dt;
    if (shadowEvent.atticTimer <= 0) {
      shadowEvent.atticTimer = 14 + Math.random() * 8;
      audio.playFootstep(0.32, true);
      (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => audio.playFootstep(0.28, true), 520);
      (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => audio.playFootstep(0.22, true), 1080);
      showSubtitle(LOOP_STORY.atticStep.speaker, LOOP_STORY.atticStep.text, 4200, false, true);
    }

    shadowEvent.foxTimer -= dt;
    if (shadowEvent.foxTimer <= 0) {
      shadowEvent.foxTimer = 22 + Math.random() * 12;
      audio.playFoxCry(true);
      showSubtitle(LOOP_STORY.foxOutside.speaker, LOOP_STORY.foxOutside.text, 4600, false, true);
    }
  }

  // Loop 1 Window Silhouette Pass
  if (state.loop === 1 && !shadowEvent.windowPassed && state.pos.z < -3.0 && livingWindowMoon) {
    shadowEvent.windowPassed = true;
    livingWindowMoon.intensity = 0.05;
    audio.playHeavyBreath(0.2);
    audio.playFoxCry(true);
    showSubtitle(LOOP_STORY.windowPass.speaker, LOOP_STORY.windowPass.text, 5200);
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (livingWindowMoon) livingWindowMoon.intensity = 1.15; }, 850);
  }

  if (shadowEvent.mode === 'loop2_doorway') {
    shadow.group.lookAt(state.pos.x, 0, state.pos.z);
    shadow.headGroup.rotation.z = 0.34 + Math.sin(tSec * 18) * 0.14;
    shadow.strobe.intensity = 0.25;
    _tmpVec.subVectors(shadow.group.position, state.pos).normalize();
    tension = 0.85;
    if (_camDir.dot(_tmpVec) > 0.55 && !shadowEvent.triggeredBehind) {
      shadowEvent.triggeredBehind = true;
      audio.playScareChord();
      state.shakeTime = 0.5;
      state.fear = Math.min(94, state.fear + 35);
      shadowEvent.timer = 0.95;
    }
    if (shadowEvent.triggeredBehind) {
      shadow.group.position.x += dt * 1.45;
      shadowEvent.timer -= dt;
      if (shadowEvent.timer <= 0) {
        audio.playBreakerSnap();
        shadowEvent.mode = 'hidden';
        shadow.group.visible = false;
      }
    }
  } else if (shadowEvent.mode === 'loop3_front') {
    shadow.group.lookAt(state.pos.x, 0, state.pos.z);
    shadow.headGroup.rotation.z = Math.sin(tSec * 2.2) * 0.22;
    const dist = shadow.group.position.distanceTo(state.pos);
    tension = Math.max(0, Math.min(0.82, 1 - (dist - 2) / 9));
    if (state.wasMoving && !isMoving && state.pos.z < -1.0) shadowEvent.echoStepTimer = 0.45;
    if (shadowEvent.echoStepTimer > 0) {
      shadowEvent.echoStepTimer -= dt;
      if (shadowEvent.echoStepTimer <= 0) {
        audio.playFootstep(0.45, true);
        if (!shadowEvent.triggeredBehind && state.pos.z < -3.0) {
          shadowEvent.triggeredBehind = true;
          audio.playHeavyBreath(0.28);
          showSubtitle(LOOP_STORY.loop3Echo.speaker, LOOP_STORY.loop3Echo.text, 5600, true);
        }
      }
    }
  } else if (shadowEvent.mode === 'loop3_chase') {
    emergencyRedLight.intensity = Math.sin(tSec * 14) > 0 ? 2.2 : 0.25;
    shadow.strobe.intensity = 0.35;
    _tmpVec.subVectors(state.pos, shadow.group.position);
    _tmpVec.y = 0;
    const dist = _tmpVec.length();

    if (shadowEvent.distractTimer > 0) {
      shadowEvent.distractTimer = Math.max(0, shadowEvent.distractTimer - dt);
      _tmpVec.subVectors(shadowEvent.distractPos, shadow.group.position);
      _tmpVec.y = 0;
      const dDist = _tmpVec.length();
      if (dDist > 0.45) {
        _tmpVec.divideScalar(dDist).multiplyScalar(2.45 * dt);
        shadow.group.position.add(_tmpVec);
        shadow.group.lookAt(shadowEvent.distractPos.x, 0, shadowEvent.distractPos.z);
      }
    } else if (dist > 0.2 && !shadowEvent.shadowStopped) {
      const c4 = state.choices.find(c => c.loop === 4);
      const chaseSpd = c4 && c4.kind === 'confront' ? 2.28 : (c4 && c4.kind === 'avoid' ? 2.72 : 2.52);
      _tmpVec.divideScalar(dist).multiplyScalar(chaseSpd * dt);
      shadow.group.position.add(_tmpVec);
      shadow.group.lookAt(state.pos.x, 0, state.pos.z);
      shadow.armL.rotation.x = -0.5 + Math.sin(tSec * 12) * 0.4;
      shadow.armR.rotation.x = -0.5 - Math.sin(tSec * 12) * 0.4;
      shadowEvent.chaseStepAccum += chaseSpd * dt;
      if (shadowEvent.chaseStepAccum > 0.95) {
        shadowEvent.chaseStepAccum = 0;
        audio.playFootstep(0.5, true);
      }
    }
    tension = 0.95;

    const lightProg = Math.max(0, Math.min(1, (-14.0 - state.pos.z) / 43.0));
    alleyLights.forEach((al, idx) => {
      const baseI = 1.9 + idx * 0.4 + lightProg * 2.4;
      al.intensity = idx < 2 && lightProg < 0.25
        ? (Math.sin(tSec * (18 + idx * 7)) > -0.6 ? baseI : 0.65)
        : baseI;
    });
    shadow.headGroup.rotation.z = 0.35 + Math.sin(tSec * 24) * 0.2;

    // Crossing front door (z < -11.8): Shadow stops at the house threshold, alleyway finale begins
    if (state.pos.z < -11.8) {
      if (!shadowEvent.shadowStopped) {
        shadowEvent.shadowStopped = true;
        shadow.group.visible = false;
        chaseBanner.classList.remove('visible');
        emergencyRedLight.intensity = 0;
        dangerPulse.style.opacity = '0';
        hudCache.dangerOp = '0.00';
        audio.playSoftRain();
        if (objectiveText) {
          objectiveText.textContent = 'Đi thẳng cuối con hẻm hướng về ánh sáng bình minh';
        }
      }

      // Clamp player before exitGlowWall
      if (state.pos.z < -56.0) state.pos.z = -56.0;

      // Ambient alley cues
      if (state.pos.z < -14.5 && !shadowEvent.dogBark1) {
        shadowEvent.dogBark1 = true;
        audio.playDogBark(true);
      }
      if (state.pos.z < -31.0 && !shadowEvent.dogBark2) {
        shadowEvent.dogBark2 = true;
        audio.playDogBark(false);
      }

      // Progressive memory lines along the 76m alleyway
      if (shadowEvent.alleyVoiceStep < ALLEY_VOICES.length) {
        const nextLine = ALLEY_VOICES[shadowEvent.alleyVoiceStep];
        if (state.pos.z <= nextLine.z) {
          shadowEvent.alleyVoiceStep += 1;
          showSubtitle(nextLine.speaker, nextLine.text, 6400, false, false, true);
        }
      }

      // Gentle dawn whiteout build-up approaching the end of the alley
      if (!shadowEvent.voicemailHold && !shadowEvent.whiteoutDone && lightWhiteout) {
        const glow = Math.max(0, Math.min(0.45, (-36.0 - state.pos.z) / 22.0));
        lightWhiteout.style.opacity = glow.toFixed(2);
      }

      // Voicemail climax at z <= -46.5
      if (state.pos.z <= -46.5 && !shadowEvent.voicemailHold && !shadowEvent.whiteoutDone) {
        shadowEvent.voicemailHold = true;
        state.velX = 0;
        state.velZ = 0;
        audio.playMemoryChime(true);
        showSubtitle('Tin nhắn thoại · Alice (02:09)', VOICEMAIL_LINE, 0, 'warm', false, true);
      }

      return 0;
    }

    if (!shadowEvent.shadowStopped && dist < 1.18) {
      audio.playScareChord();
      state.shakeTime = 0.65;
      state.chaseCaughtCount += 1;
      if (state.chaseCaughtCount >= 2) {
        shadowEvent.shadowStopped = true;
        shadow.group.visible = false;
        chaseBanner.classList.remove('visible');
        emergencyRedLight.intensity = 0;
        dangerPulse.style.opacity = '0';
        hudCache.dangerOp = '0.00';
        triggerTrueEnding('bad');
        return 0;
      }
      state.pos.set(4.4, 1.65, -4.5);
      state.velX = 0; state.velZ = 0;
      shadow.group.position.set(0.2, 0, -1.8);
      showSubtitle('Steve', 'Đừng quay lại nữa! Chỉ còn một cơ hội — giữ [Shift] chạy thẳng qua Cửa chính!', 3800, true);
    }
  }

  // Look-away gaslighting & ambient scares
  if (shadowEvent.mode !== 'loop3_chase' && shadowEvent.mode !== 'loop2_doorway' && !state.holdingPaper) {
    if (state.loop >= 2) {
      shadowEvent.spatialWhisperCooldown -= dt;
      if (shadowEvent.spatialWhisperCooldown <= 0) {
        shadowEvent.spatialWhisperCooldown = 17 + Math.random() * 12;
        const side = Math.random() < 0.5 ? -0.88 : 0.88;
        if (Math.random() < 0.58) audio.playSpatialWhisper(side);
        else audio.playSpatialKnock(side);
      }

      shadowEvent.doorCreakCooldown -= dt;
      if (shadowEvent.doorCreakCooldown <= 0) {
        shadowEvent.doorCreakCooldown = 20 + Math.random() * 14;
        for (let i = 0; i < doors.length; i++) {
          const d = doors[i];
          if (d.isFrontDoor) continue;
          if (d.id === 'door_study' && state.loop === 1 && !state.studyKeyFound) continue;
          _tmpVec.subVectors(d.worldPos, state.pos);
          const dist = _tmpVec.length();
          if (dist > 2.2 && dist < 8.5) {
            _tmpVec.divideScalar(dist);
            if (_camDir.dot(_tmpVec) < -0.25) {
              d.isOpen = !d.isOpen;
              d.targetOffset = d.isOpen ? -Math.PI * 0.28 : 0;
              d.collider.active = !d.isOpen;
              const pan = computeStereoPan(d.worldPos, state.pos, playerRight);
              audio.playDoorCreak(!d.isOpen);
              audio.playSpatialWhisper(pan);
              break;
            }
          }
        }
      }
    }

    if ((state.loop === 3 || state.loop === 4) && shadowEvent.mode === 'hidden') {
      shadowEvent.peekCooldown -= dt;
      if (shadowEvent.peekCooldown <= 0) {
        let chosen = null;
        for (let k = 0; k < PEEK_SPOTS.length; k++) {
          const sp = PEEK_SPOTS[(k + Math.floor(Math.random() * PEEK_SPOTS.length)) % PEEK_SPOTS.length];
          _tmpVec.subVectors(sp, state.pos);
          const dist = _tmpVec.length();
          if (dist > 3.6 && dist < 9.5) {
            _tmpVec.divideScalar(dist);
            const dot = _camDir.dot(_tmpVec);
            if (dot > -0.2 && dot < 0.68) { chosen = sp; break; }
          }
        }
        if (chosen) {
          shadowEvent.mode = 'peripheral_peek';
          shadowEvent.peekActive = true;
          shadowEvent.peekVanishTimer = 0;
          shadow.group.position.copy(chosen);
          shadow.group.visible = true;
          audio.triggerDeadSilence(1400);
        } else {
          shadowEvent.peekCooldown = 6.0;
        }
      }
    } else if (shadowEvent.mode === 'peripheral_peek') {
      shadow.group.lookAt(state.pos.x, 0, state.pos.z);
      shadow.headGroup.rotation.z = Math.sin(tSec * 4.5) * 0.16;
      _tmpVec.subVectors(shadow.group.position, state.pos);
      const dist = _tmpVec.length();
      _tmpVec.divideScalar(dist || 1);
      const dot = _camDir.dot(_tmpVec);
      tension = Math.max(tension, 0.55);

      if ((dot > 0.84 || dist < 2.6) && shadowEvent.peekVanishTimer === 0) {
        shadowEvent.peekVanishTimer = 0.28;
        const pan = computeStereoPan(shadow.group.position, state.pos, playerRight);
        audio.playSpatialWhisper(pan);
        state.fear = Math.min(100, state.fear + 12);
        state.shakeTime = 0.22;
      }
      if (shadowEvent.peekVanishTimer > 0) {
        shadowEvent.peekVanishTimer -= dt;
        if (shadowEvent.peekVanishTimer <= 0) {
          shadow.group.visible = false;
          shadowEvent.mode = 'hidden';
          shadowEvent.peekActive = false;
          shadowEvent.peekCooldown = 22 + Math.random() * 14;
        }
      }
    }

    // Match blow-out by cold breath
    if (state.loop >= 3 && state.matchTimer > 4.5 && shadowEvent.blowOutsInLoop < 2) {
      shadowEvent.blowOutCooldown -= dt;
      if (shadowEvent.blowOutCooldown <= 0) {
        shadowEvent.blowOutsInLoop += 1;
        shadowEvent.blowOutCooldown = 28 + Math.random() * 15;
        const earPan = Math.random() < 0.5 ? -0.85 : 0.85;
        audio.triggerDeadSilence(1300);
        (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
          if (!state.running || state.paused || state.ended || state.matchTimer <= 0) return;
          audio.playMatchBlowOut(earPan);
          state.matchTimer = 0;
          ctx.matchGroup.visible = false;
          ctx.matchLight.intensity = 0;
          state.shakeTime = 0.28;
          state.fear = Math.min(100, state.fear + 14);
          ctx.updateHUD();
          showSubtitle('Hơi thở lạnh sát gáy!', 'Có luồng gió lạnh vừa thổi tắt phụt que diêm ngay trên tay...', 4200, true, true);
        }, 850);
      }
    }
  }

  const dOp = (tension * 0.78).toFixed(2);
  if (hudCache.dangerOp !== dOp) {
    hudCache.dangerOp = dOp;
    dangerPulse.style.opacity = dOp;
  }
  return tension;
}

export function updateFearAndLighting(dt, tSec, ctx) {
  const {
    state,
    camera,
    candles,
    lights,
    panicOverlay,
    blinkOverlay,
    blinkClock,
    blinkSub,
    audio,
    showSubtitle,
    clearKeys
  } = ctx;

  let inLight = state.matchTimer > 0
    || (lights.bedroomLampLight.intensity > 0.2 && state.pos.z > 0.2 && state.pos.x < 3.5)
    || (lights.bathLight.intensity > 0.35 && state.pos.x > 3.5 && state.pos.z > -1.0)
    || (lights.fridgeLight.intensity > 0.4 && state.pos.x < -4.0);

  if (!inLight) {
    for (const c of candles) {
      if (c.lit && state.pos.distanceTo(c.worldPos) < 4.5) {
        inLight = true;
        break;
      }
    }
  }

  if (state.panicCooldown > 0) state.panicCooldown = Math.max(0, state.panicCooldown - dt);
  if (state.panicTimer > 0) {
    state.panicTimer = Math.max(0, state.panicTimer - dt * (inLight ? 2.2 : 1.0));
    if (state.panicTimer === 0) {
      panicOverlay.classList.remove('active');
      document.body.classList.remove('in-panic');
    }
  }

  if (inLight) state.fear = Math.max(0, state.fear - dt * 8.2);
  else state.fear = Math.min(100, state.fear + dt * 4.8);

  // Fear 100% Panic Attack
  if (state.fear >= 100 && state.panicCooldown <= 0 && !state.holdingPaper) {
    state.panicTimer = 3.6;
    state.panicCooldown = 9.0;
    state.panicCountInLoop += 1;
    state.shakeTime = 1.45;
    panicOverlay.classList.add('active');
    document.body.classList.add('in-panic');
    audio.playScareChord();
    audio.playHeavyBreath(0.85);

    if (state.panicCountInLoop >= 2 && ctx.shadowEvent.mode !== 'loop3_chase') {
      state.fear = 55;
      clearKeys();
      blinkClock.textContent = '02:14';
      blinkSub.textContent = 'Nghẹt thở trong bóng tối...';
      blinkOverlay.style.opacity = '1'; blinkClock.style.opacity = '1'; blinkSub.style.opacity = '1';
      showSubtitle('Hoảng loạn cực độ!', 'Tầm nhìn tối sầm lại... Bóng tối vừa kéo giật mình quay về phòng ngủ! Hãy giữ lửa diêm [F] hoặc thắp nến!', 5600, true);
      (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
        if (state.ended) return;
        state.pos.set(0.35, 1.65, 2.35);
        state.velX = 0; state.velZ = 0;
        blinkClock.style.opacity = '0'; blinkSub.style.opacity = '0'; blinkOverlay.style.opacity = '0';
      }, 950);
    } else {
      state.fear = 72;
      showSubtitle('Cơn hoảng loạn · Áp lực 100%!', 'Tim đập loạn nhịp, chân nặng trĩu... Quẹt diêm [F] hoặc tìm ánh sáng ngay trước khi ngất đi!', 5200, true);
    }
  }

  // Tunnel Vision FOV
  const targetFov = state.panicTimer > 0
    ? 56 + Math.sin(tSec * 16) * 1.4
    : (state.fear > 75 ? 66 - ((state.fear - 75) / 25) * 4.5 : 66);
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-7 * dt));
    camera.updateProjectionMatrix();
  }
}
```

---

### <a id="src-game-loopManager-js"></a> Tập tin: `src/game/loopManager.js` (510 dòng)

```javascript
import * as THREE from 'three';
import { TOTAL_LOOPS, LOOP_ANOMALY_REQ, LOOP_STORY, MORAL_CHOICES } from '../config/storyData.js';
import { saveRunProgress } from './saveManager.js';

export function setupLoopEnvironment(loopNum, ctx) {
  const {
    state,
    audio,
    scene,
    camera,
    doors,
    candles,
    hplDrawers,
    hplProps,
    objects,
    lights,
    puzzles,
    materials,
    shadow,
    shadowEvent,
    hudCache,
    eyelidTop,
    eyelidBottom,
    eyeHaze,
    panicOverlay,
    dangerPulse,
    chaseBanner,
    lightWhiteout,
    subtitleBox,
    endingPhone,
    keypadScreen,
    objectiveText,
    clearInteractUI,
    updateHUD,
    releaseHplGrab
  } = ctx;

  if (ctx.timers) ctx.timers.clearAll();
  clearInteractUI();
  state.loop = loopNum;
  state.loopClueFound = false;
  state.wakingDuration = loopNum === 1 ? 4.6 : 3.1;
  state.wakingTimer = state.wakingDuration;
  state.wakeStepPlayed = false;

  eyelidTop.style.transform = 'translateY(0%)';
  eyelidBottom.style.transform = 'translateY(0%)';
  eyeHaze.style.opacity = '0.92';

  state.pos.set(0.35, 1.65, 2.35);
  state.yaw = 0.25; state.pitch = 0.05;
  state.targetYaw = 0.25; state.targetPitch = 0.05;
  state.velX = 0; state.velZ = 0; state.bobBlend = 0;
  state.fear = loopNum >= 4 ? 22 : 0;
  state.matchTimer = 0;
  state.anomaliesFound = 0;
  state.anomaliesRequired = LOOP_ANOMALY_REQ[loopNum] || 2;
  state.chaseCaughtCount = 0;
  state.panicTimer = 0;
  state.panicCooldown = 0;
  state.panicCountInLoop = 0;

  panicOverlay.classList.remove('active');
  document.body.classList.remove('in-panic');
  camera.fov = 66; camera.updateProjectionMatrix();

  state.holdingPaper = false;
  state.holdingPaperSource = null;
  state.paperAnim = 0;
  if (ctx.heldPaperGroup) ctx.heldPaperGroup.visible = false;
  ctx.crosshair.style.opacity = '';

  ctx.matchGroup.visible = false;
  ctx.matchLight.intensity = 0;
  dangerPulse.style.opacity = '0';
  hudCache.dangerOp = '0.00';
  chaseBanner.classList.remove('visible');
  lights.emergencyRedLight.intensity = 0;

  shadowEvent.mode = 'hidden';
  shadowEvent.triggeredBehind = false;
  shadowEvent.windowPassed = false;
  shadowEvent.portraitFell = false;
  shadowEvent.atticTimer = 7.5;
  shadowEvent.foxTimer = 15.0 + Math.random() * 7;
  shadowEvent.alleyFoxCried = false;
  shadowEvent.alleyVoiceStep = 0;
  shadowEvent.dogBark1 = false;
  shadowEvent.dogBark2 = false;
  shadowEvent.whiteoutDone = false;
  shadowEvent.melodyStarted = false;
  shadowEvent.shadowStopped = false;
  shadowEvent.voicemailHold = false;
  shadowEvent.voicemailAdvanced = false;
  shadowEvent.peekCooldown = loopNum >= 3 ? 9.0 : 999;
  shadowEvent.peekVanishTimer = 0;
  shadowEvent.peekActive = false;
  shadowEvent.doorCreakCooldown = loopNum >= 2 ? 12.0 : 20.0;
  shadowEvent.blowOutCooldown = loopNum >= 3 ? 16.0 : 999;
  shadowEvent.blowOutsInLoop = 0;
  shadowEvent.spatialWhisperCooldown = loopNum >= 2 ? 11.0 : 999;

  if (endingPhone) endingPhone.classList.remove('show');
  subtitleBox.classList.remove('voicemail-hold');
  lightWhiteout.style.opacity = '0';
  subtitleBox.classList.remove('warm-voice');
  shadow.group.visible = false;

  objects.wardrobeObj.checkedInLoop = 0;
  objects.mirrorObj.checkedInLoop = 0;
  objects.bathMirrorObj.checkedInLoop = 0;
  objects.fridgeObj.checkedInLoop = 0;
  objects.kitchenNoteObj.readInLoop = 0;
  objects.clockAnomalyObj.checkedInLoop = 0;
  objects.chairAnomalyObj.checkedInLoop = 0;
  objects.portraitAnomalyObj.checkedInLoop = 0;
  objects.scrawlAnomalyObj.checkedInLoop = 0;
  objects.smartphoneObj.checkedInLoop = 0;
  objects.brokenMugObj.checkedInLoop = 0;
  objects.rainPuddleObj.checkedInLoop = 0;
  puzzles.matchboxObj.pickedInLoop = 0;

  if (loopNum >= 2 && state.matchesLeft < 3) {
    state.matchesLeft = 3;
  }

  const mbSpot = puzzles.MATCHBOX_SPOTS[loopNum];
  if (mbSpot) {
    puzzles.matchboxGroup.position.copy(mbSpot);
    puzzles.matchboxObj.worldPos.copy(mbSpot);
    puzzles.matchboxGroup.visible = true;
    if (ctx.matchboxGlint) {
      ctx.matchboxGlint.basePos.copy(mbSpot).add(new THREE.Vector3(0, 0.09, 0));
      ctx.matchboxGlint.sprite.position.copy(ctx.matchboxGlint.basePos);
    }
  } else {
    puzzles.matchboxGroup.visible = false;
  }

  objects.brokenMugGroup.visible = true;
  objects.doorRainPuddle.visible = loopNum >= 2;
  objects.flowersGroup.visible = loopNum >= 5;
  objects.secondPillowMesh.visible = loopNum <= 3;
  lights.ambRedLight.intensity = 0;
  lights.ambBlueLight.intensity = 0;
  lights.kitchenGuideLight.intensity = loopNum === 2 ? 0.95 : 0;

  if (loopNum <= 2) {
    objects.drawSmartphoneScreen('silent');
    lights.smLight.color.setHex(0x88b4ff); lights.smLight.intensity = 0.28;
  } else if (loopNum === 3) {
    objects.drawSmartphoneScreen('missed');
    lights.smLight.color.setHex(0xff5a50); lights.smLight.intensity = 0.72;
  } else {
    objects.drawSmartphoneScreen('voicemail');
    lights.smLight.color.setHex(0xf7c37c); lights.smLight.intensity = 0.72;
  }

  objects.kitchenFaucetObj.running = loopNum >= 2;
  objects.kitchenFaucetObj.dripping = loopNum === 1;
  objects.kitchenWaterMesh.visible = objects.kitchenFaucetObj.running;
  objects.bathFaucetObj.running = loopNum >= 2;
  objects.bathFaucetObj.dripping = loopNum === 1;
  objects.bathWaterMesh.visible = objects.bathFaucetObj.running;

  objects.fridgeObj.targetAngle = loopNum === 1 ? 0.26 : loopNum === 2 ? 0.55 : 1.15;
  objects.fridgeDoorPivot.rotation.y = objects.fridgeObj.targetAngle;
  lights.fridgeLight.intensity = loopNum === 3 ? 0.75 : 1.05;
  lights.bathLight.intensity = loopNum === 1 ? 0.95 : loopNum === 2 ? 0.62 : 0.22;

  materials.bathMirrorMat.map = loopNum === 1 ? materials.bathMirrorCleanTex : loopNum <= 3 ? materials.bathMirrorFogTex : materials.bathMirrorCrackedTex;
  materials.bathMirrorMat.needsUpdate = true;
  materials.mirrorMat.map = loopNum >= 4 ? materials.mirrorCrackedTex : materials.mirrorCleanTex;
  materials.mirrorMat.needsUpdate = true;

  objects.portraitGroup.position.set(-3.82, 1.82, -3.4);
  objects.portraitGroup.rotation.set(0, 0, 0);
  objects.phoneObj.ringing = false;
  objects.phoneObj.answered = false;
  objects.phoneLed.intensity = 0;

  releaseHplGrab(false);

  doors.forEach((d) => {
    d.isOpen = false; d.targetOffset = 0; d.currentOffset = 0; d.angVel = 0; d.rattleTime = 0;
    d.pivot.rotation.y = d.baseRotY; d.collider.active = true;
  });

  hplDrawers.forEach((dr) => {
    dr.openDist = 0; dr.vel = 0; dr.inspectedInLoop = 0;
    dr.group.position.copy(dr.basePos);
    dr.worldPos.copy(dr.basePos).addScaledVector(dr.slideAxis, 0.2);
  });

  hplProps.forEach((p) => {
    p.isDynamic = false;
    p.vel.set(0, 0, 0);
    p.angVel.set(0, 0, 0);
    p.group.position.copy(p.homePos);
    p.group.rotation.set(0, 0, 0);
    p.worldPos.copy(p.homePos);
  });
  shadowEvent.distractTimer = 0;

  puzzles.clueGroup.visible = true;
  objectiveText.textContent = LOOP_STORY[loopNum].objective;

  state.studyKeyFound = loopNum !== 1;
  state.breakerFixed = loopNum !== 2;
  state.codeUnlocked = loopNum !== TOTAL_LOOPS;
  keypadScreen.classList.add('hidden');

  if (loopNum === 1) {
    const spot = puzzles.STUDY_KEY_SPOTS[Math.floor(Math.random() * puzzles.STUDY_KEY_SPOTS.length)];
    puzzles.studyKeyGroup.position.copy(spot.pos);
    puzzles.studyKeyObj.worldPos.copy(spot.pos);
    if (ctx.keyGlint) {
      ctx.keyGlint.basePos.copy(spot.pos).add(new THREE.Vector3(0, 0.09, 0));
      ctx.keyGlint.sprite.position.copy(ctx.keyGlint.basePos);
    }
    puzzles.studyKeyGroup.visible = true;
    puzzles.breakerLeverPivot.rotation.x = 0.35;
    materials.breakerLedMat.color.setHex(0x38d97c);
    puzzles.breakerLight.intensity = 0;
    lights.studyLampLight.intensity = 0.75;
  } else if (loopNum === 2) {
    puzzles.studyKeyGroup.visible = false;
    puzzles.breakerLeverPivot.rotation.x = -0.55;
    materials.breakerLedMat.color.setHex(0xff382e);
    puzzles.breakerLight.color.setHex(0xff382e);
    puzzles.breakerLight.intensity = 1.1;
    lights.studyLampLight.intensity = 0;
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (state.loop === 2 && !state.ended) audio.playBreakerSnap(); }, 1200);
  } else {
    puzzles.studyKeyGroup.visible = false;
    puzzles.breakerLeverPivot.rotation.x = 0.35;
    materials.breakerLedMat.color.setHex(0x38d97c);
    puzzles.breakerLight.intensity = 0;
    lights.studyLampLight.intensity = 0.75;
  }

  if (loopNum === 1) {
    lights.bedroomLampLight.intensity = 1.45;
    objects.wardrobeDoorPivot.rotation.y = 0; objects.wardrobeDoorPivot2.rotation.y = 0; objects.wardrobeObj.targetAngle = 0; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitCleanTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.82, 1.82, -3.4); objects.portraitGroup.rotation.set(0.24, 0, 0);
    objects.portraitAnomalyObj.worldPos.set(-3.75, 1.75, -3.4);
    objects.wallScrawl.visible = false; lights.tvLight.intensity = 0;
    materials.tvScreenMat.map = null; materials.tvScreenMat.color.setHex(0x080a0d); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(-0.65, 0, -4.1); objects.chairGroup.rotation.set(0, -0.7, 0);
    objects.chairAnomalyObj.worldPos.set(-0.65, 0.65, -4.1);
    objects.drawClockFace('02:14');
    lights.dawnLight.intensity = 0;
    if (lights.livingWindowMoon) { lights.livingWindowMoon.color.setHex(0x638cb8); lights.livingWindowMoon.intensity = 1.15; }
  } else if (loopNum === 2) {
    lights.bedroomLampLight.intensity = 0;
    lights.bathLight.intensity = 0.08;
    objects.wardrobeDoorPivot.rotation.y = -0.15; objects.wardrobeObj.targetAngle = -0.58;
    objects.wardrobeDoorPivot2.rotation.y = 0; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.82, 1.82, -3.4); objects.portraitGroup.rotation.set(0.38, 0, 0);
    objects.portraitAnomalyObj.worldPos.set(-3.75, 1.75, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex2; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.25;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(-0.2, 0, -2.5); objects.chairGroup.rotation.set(0, 0, 0);
    objects.chairAnomalyObj.worldPos.set(-0.2, 0.65, -2.5);
    objects.drawClockFace('02:14');
    lights.dawnLight.intensity = 0;
    objects.phoneObj.ringing = true; objects.phoneLed.intensity = 1.2;
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (state.loop === 2 && !state.ended) audio.playThreeKnocks(); }, 950);
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (state.loop === 2 && !state.ended) audio.playWardrobeCreak(true); }, 2100);
  } else if (loopNum === 3) {
    lights.bedroomLampLight.intensity = 0.72;
    objects.wardrobeDoorPivot.rotation.y = -0.45; objects.wardrobeObj.targetAngle = -0.78;
    objects.wardrobeDoorPivot2.rotation.y = 0.12; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.82, 1.82, -3.4); objects.portraitGroup.rotation.set(Math.PI, 0, 0);
    objects.portraitAnomalyObj.worldPos.set(-3.75, 1.75, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex3; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.35;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(-2.35, 0, -8.1); objects.chairGroup.rotation.set(0, -Math.PI / 2, 0);
    objects.chairAnomalyObj.worldPos.set(-2.35, 0.65, -8.1);
    objects.drawClockFace('02:13');
    objects.phoneObj.ringing = true; objects.phoneLed.intensity = 1.3;
    lights.dawnLight.intensity = 0;
  } else if (loopNum === 4) {
    lights.bedroomLampLight.intensity = 0.45;
    objects.wardrobeDoorPivot.rotation.y = -1.1; objects.wardrobeObj.targetAngle = -1.1;
    objects.wardrobeDoorPivot2.rotation.y = 0.85; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.45, 0.08, -3.4); objects.portraitGroup.rotation.set(0, 0.25, -Math.PI / 2);
    objects.portraitAnomalyObj.worldPos.set(-3.45, 0.35, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex4; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.25;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(0.0, 0, -9.2); objects.chairGroup.rotation.set(0, Math.PI, 0);
    objects.chairAnomalyObj.worldPos.set(0.0, 0.65, -9.2);
    objects.drawClockFace('ERR!');
    objects.phoneObj.ringing = true; objects.phoneLed.intensity = 1.3;
    lights.dawnLight.intensity = 0;
  } else if (loopNum === 5) {
    lights.bedroomLampLight.intensity = 0;
    objects.wardrobeDoorPivot.rotation.y = -1.45; objects.wardrobeObj.targetAngle = -1.45;
    objects.wardrobeDoorPivot2.rotation.y = 1.45; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.45, 0.08, -3.4); objects.portraitGroup.rotation.set(0, 0.35, -Math.PI / 2);
    objects.portraitAnomalyObj.worldPos.set(-3.45, 0.35, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex5; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.1;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(0.25, 0.24, -4.6); objects.chairGroup.rotation.set(0.15, 0.4, Math.PI / 2);
    objects.chairAnomalyObj.worldPos.set(0.25, 0.45, -4.6);
    objects.drawClockFace('02:14');
    lights.dawnLight.intensity = 0;
    shadowEvent.mode = 'loop3_front';
    shadow.group.position.set(0, 0, -9.2);
    shadow.group.visible = true;
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
      if (state.loop === TOTAL_LOOPS && !state.ended) {
        audio.playWoodScratch(5);
        state.shakeTime = 0.55;
      }
    }, 2100);
  }

  // Branching room shifts based on previous choices
  const c1 = state.choices.find(c => c.loop === 1);
  const c2 = state.choices.find(c => c.loop === 2);
  const c3 = state.choices.find(c => c.loop === 3);

  if (loopNum === 2 && c1) {
    if (c1.kind === 'avoid') {
      state.fear = 16;
      objects.chairGroup.position.set(0.0, 0, -9.15);
      objects.chairGroup.rotation.set(0, Math.PI, 0);
      objects.chairAnomalyObj.worldPos.set(0.0, 0.65, -9.15);
    } else {
      objects.doorRainPuddle.scale.set(1.65, 0.9, 1);
    }
  }
  if (loopNum === 3 && c2) {
    if (c2.kind === 'avoid') {
      scene.fog.density = 0.125;
      shadowEvent.peekCooldown = 5.5;
      state.fear = 18;
    } else {
      scene.fog.density = 0.098;
      const livingCandle = candles.find(c => c.id === 'candle_living');
      if (livingCandle) {
        livingCandle.lit = true;
        livingCandle.flame.visible = true;
        livingCandle.light.intensity = 1.45;
      }
    }
  }
  if (loopNum === 4 && c3) {
    if (c3.kind === 'avoid') {
      lights.bedroomLampLight.intensity = 0.12;
      state.fear = 32;
    } else {
      lights.bedroomLampLight.intensity = 0.72;
      state.fear = 10;
    }
  }
  if (loopNum === 5) {
    scene.fog.density = 0.095 + state.denialScore * 0.008;
    state.fear = Math.min(48, 12 + state.denialScore * 9);
  }

  updateHUD();
  saveRunProgress(state);
}

export function recordAnomalyFound(ctx) {
  const { state, audio, objectiveText, updateHUD } = ctx;
  if (state.anomaliesFound >= state.anomaliesRequired) return;
  state.anomaliesFound += 1;
  updateHUD();
  if (state.anomaliesFound === state.anomaliesRequired) {
    audio.playMemoryChime(false);
    if (state.loop === 1 && !state.studyKeyFound) {
      objectiveText.textContent = 'Đã đủ điểm bất thường! Tìm chìa khóa phòng làm việc → kiểm tra bàn';
    } else if (state.loop === 2 && !state.breakerFixed) {
      objectiveText.textContent = 'Đã đủ điểm bất thường! Vào Nhà bếp bật Cầu dao điện → kiểm tra bàn';
    } else if (state.loop === TOTAL_LOOPS) {
      objectiveText.textContent = 'Đã đủ 3 điểm bất thường! Vào phòng làm việc giải khóa mã 4 số';
    } else {
      objectiveText.textContent = 'Đã đủ điểm bất thường! Vào phòng làm việc kiểm tra manh mối trên bàn';
    }
  }
}

export function openChoiceModal(loopNum, ctx) {
  const {
    state,
    choiceScreen,
    choiceKicker,
    choiceTitle,
    choicePrompt,
    choiceALabel,
    choiceASub,
    choiceBLabel,
    choiceBSub,
    clearKeys,
    clearInteractUI,
    transitionToLoop
  } = ctx;

  const cfg = MORAL_CHOICES[loopNum];
  if (!cfg) {
    transitionToLoop(loopNum + 1, ctx);
    return;
  }
  state.pendingChoiceLoop = loopNum;
  state.paused = true;
  clearKeys();
  clearInteractUI();
  if (document.pointerLockElement) document.exitPointerLock();

  choiceKicker.textContent = cfg.kicker;
  choiceTitle.textContent = cfg.title;
  choicePrompt.textContent = cfg.prompt;
  choiceALabel.textContent = cfg.a.label;
  choiceASub.textContent = cfg.a.sub;
  choiceBLabel.textContent = cfg.b.label;
  choiceBSub.textContent = cfg.b.sub;
  choiceScreen.classList.remove('hidden');
}

export function resolveMoralChoice(kind, ctx) {
  const {
    state,
    audio,
    choiceScreen,
    renderJournal,
    updateHUD,
    showSubtitle,
    transitionToLoop
  } = ctx;

  const loopNum = state.pendingChoiceLoop;
  const cfg = MORAL_CHOICES[loopNum];
  choiceScreen.classList.add('hidden');
  state.pendingChoiceLoop = 0;
  if (!cfg) return;

  const picked = kind === 'confront' ? cfg.a : cfg.b;
  state.choices = state.choices.filter(c => c.loop !== loopNum);
  state.choices.push({ loop: loopNum, kind, id: picked.id, chip: picked.chip });
  state.courageScore = state.choices.filter(c => c.kind === 'confront').length;
  state.denialScore = state.choices.filter(c => c.kind === 'avoid').length;

  state.journalNotes.push({
    title: `Quyết định Vòng ${loopNum} — ${picked.chip}`,
    text: picked.journal
  });
  renderJournal();

  if (kind === 'confront') {
    audio.playMemoryChime(false);
  } else {
    audio.playDoorSlam();
    if (loopNum === 2 && state.matchesLeft > 1) {
      state.matchesLeft -= 1;
      updateHUD();
    }
  }

  saveRunProgress(state);
  showSubtitle(picked.reactSpeaker, picked.reactText, 3200, kind === 'avoid');
  (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
    if (state.ended) return;
    transitionToLoop(loopNum + 1, ctx);
  }, 1500);
}

export function transitionToLoop(nextLoop, ctx) {
  const {
    state,
    audio,
    blinkClock,
    blinkSub,
    blinkOverlay,
    clearInteractUI,
    showSubtitle,
    narrator
  } = ctx;

  clearInteractUI();
  if (narrator && narrator.stop) narrator.stop();
  state.paused = true;
  audio.playLoopReset();

  blinkClock.textContent = '02:14';
  blinkSub.textContent = LOOP_STORY[nextLoop].clockSub;
  blinkOverlay.style.opacity = '1';
  blinkClock.style.opacity = '1';
  blinkSub.style.opacity = '1';

  (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
    setupLoopEnvironment(nextLoop, ctx);
    state.paused = false;
    blinkClock.style.opacity = '0';
    blinkSub.style.opacity = '0';
    blinkOverlay.style.opacity = '0';
    showSubtitle(LOOP_STORY[nextLoop].wakeSpeaker, LOOP_STORY[nextLoop].wakeText, 7200);
  }, 1700);
}
```

---

### <a id="src-game-saveManager-js"></a> Tập tin: `src/game/saveManager.js` (55 dòng)

```javascript
import { TOTAL_LOOPS } from '../config/storyData.js';

const SAVE_STORAGE_KEY = 'dem_khong_dut_save_v1';

export function loadSavedRun() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const loop = Number(data.loop);
    if (!Number.isInteger(loop) || loop < 1 || loop > TOTAL_LOOPS) return null;
    const choices = Array.isArray(data.choices) ? data.choices : [];
    const journalNotes = Array.isArray(data.journalNotes) ? data.journalNotes : [];
    // Only offer Continue if player has progressed past Loop 1 or recorded notes/choices
    if (loop === 1 && choices.length === 0 && journalNotes.length === 0) return null;
    return {
      loop,
      matchesLeft: Number.isFinite(Number(data.matchesLeft)) ? Math.max(2, Number(data.matchesLeft)) : 6,
      choices,
      journalNotes,
      courageScore: Number.isFinite(Number(data.courageScore)) ? Number(data.courageScore) : choices.filter((c) => c.kind === 'confront').length,
      denialScore: Number.isFinite(Number(data.denialScore)) ? Number(data.denialScore) : choices.filter((c) => c.kind === 'avoid').length,
      updatedAt: Number(data.updatedAt) || Date.now()
    };
  } catch (_) {
    return null;
  }
}

export function saveRunProgress(state) {
  if (!state || state.ended) return;
  try {
    const payload = {
      version: 1,
      loop: Math.max(1, Math.min(TOTAL_LOOPS, Number(state.loop) || 1)),
      matchesLeft: Math.max(0, Number(state.matchesLeft) || 0),
      choices: Array.isArray(state.choices) ? state.choices : [],
      journalNotes: Array.isArray(state.journalNotes) ? state.journalNotes : [],
      courageScore: Number(state.courageScore) || 0,
      denialScore: Number(state.denialScore) || 0,
      updatedAt: Date.now()
    };
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {
    // Ignore storage quota or private mode restrictions
  }
}

export function clearSavedRun() {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch (_) {}
}
```

---

### <a id="src-game-state-js"></a> Tập tin: `src/game/state.js` (50 dòng)

```javascript
import * as THREE from 'three';

export function createGameState() {
  return {
    running: false,
    paused: false,
    ended: false,
    inIntro: false,
    loop: 1,
    loopClueFound: false,
    wakingTimer: 0,
    wakingDuration: 4.6,
    wakeStepPlayed: false,
    yaw: 0,
    pitch: 0,
    targetYaw: 0,
    targetPitch: 0,
    pos: new THREE.Vector3(0.35, 1.65, 2.35),
    velX: 0,
    velZ: 0,
    bobPhase: 0,
    bobBlend: 0,
    fear: 0,
    matchesLeft: 10,
    matchTimer: 0,
    matchMax: 28,
    journalNotes: [],
    stepAccum: 0,
    wasMoving: false,
    subtitleTimeout: null,
    shakeTime: 0,
    holdingPaper: false,
    holdingPaperSource: null,
    paperAnim: 0,
    studyKeyFound: false,
    breakerFixed: true,
    codeUnlocked: false,
    anomaliesFound: 0,
    anomaliesRequired: 2,
    chaseCaughtCount: 0,
    panicTimer: 0,
    panicCooldown: 0,
    panicCountInLoop: 0,
    choices: [],
    courageScore: 0,
    denialScore: 0,
    pendingChoiceLoop: 0
  };
}
```

---

### <a id="src-game-timerManager-js"></a> Tập tin: `src/game/timerManager.js` (52 dòng)

```javascript
// Centralized timer manager to prevent orphan setTimeout/setInterval callbacks
// from leaking across loop resets, retries, or returning to the title screen.

export function createTimerManager() {
  const timeouts = new Set();
  const intervals = new Set();

  function scheduleTimeout(fn, delayMs) {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, delayMs);
    timeouts.add(id);
    return id;
  }

  function scheduleInterval(fn, intervalMs) {
    const id = window.setInterval(fn, intervalMs);
    intervals.add(id);
    return id;
  }

  function clearTimeoutSafe(id) {
    if (timeouts.has(id)) {
      window.clearTimeout(id);
      timeouts.delete(id);
    }
  }

  function clearIntervalSafe(id) {
    if (intervals.has(id)) {
      window.clearInterval(id);
      intervals.delete(id);
    }
  }

  function clearAll() {
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts.clear();
    intervals.forEach((id) => window.clearInterval(id));
    intervals.clear();
  }

  return {
    setTimeout: scheduleTimeout,
    setInterval: scheduleInterval,
    clearTimeout: clearTimeoutSafe,
    clearInterval: clearIntervalSafe,
    clearAll
  };
}
```

---

### <a id="src-main-js"></a> Tập tin: `src/main.js` (2,363 dòng)

```javascript
import * as THREE from "three";
import "./style.css";
import { HouseAudio } from "./audio.js";

// Configuration modules
import {
  DEFAULT_SETTINGS,
  GFX_PRESETS,
  loadSettings,
  saveSettings,
} from "./config/settings.js";
import { TOTAL_LOOPS, LOOP_STORY, MORAL_CHOICES } from "./config/storyData.js";
import { getHeldPaperContent } from "./config/heldPaperContent.js";

// World modules
import {
  makeHeldPaperTexture,
  updateTVStatic,
  tvStaticTex,
} from "./world/textures.js";
import { createMaterials } from "./world/materials.js";
import { createHouse } from "./world/house.js";
import { createDoorsSystem } from "./world/doors.js";
import { createPuzzlesSystem } from "./world/puzzles.js";
import { createShadowPresence } from "./world/entity.js";

// Game logic & director modules
import { createGameState } from "./game/state.js";
import { createTimerManager } from "./game/timerManager.js";
import { loadSavedRun, clearSavedRun } from "./game/saveManager.js";
import {
  computeStereoPan,
  createShadowEventState,
  updateShadowEvents,
  updateFearAndLighting,
} from "./game/horrorDirector.js";
import {
  setupLoopEnvironment,
  recordAnomalyFound,
  openChoiceModal,
  resolveMoralChoice,
  transitionToLoop,
} from "./game/loopManager.js";
import {
  showEndingScreen,
  triggerTrueEnding,
  beginLoop1AfterIntro,
  startNewGame,
  retryCurrentLoop,
  startQuickEndingTest,
  advanceVoicemailSequence,
  clearIntroTimers,
  clearFinaleTimers,
} from "./game/endings.js";

// Player equipment & physics modules
import {
  createMatchSystem,
  toggleOrStrikeMatch,
  updateMatch,
} from "./player/match.js";
import { createHeldPaperSystem, updateHeldPaper } from "./player/heldPaper.js";
import {
  createHplPhysicsState,
  isHplGrabbable,
  startHplGrab,
  releaseHplGrab,
  applyHplMouseDrag,
  updateHplPhysics,
} from "./player/hplPhysics.js";
import {
  keys,
  clearKeys,
  collides,
  updatePlayerMovement,
} from "./player/controls.js";

// UI modules
import { createHudCache, updateHUD, clearInteractUI } from "./ui/hud.js";
import { createNarrator, createSubtitleSystem } from "./ui/subtitles.js";
import { renderJournal, toggleJournal } from "./ui/journal.js";
import { createKeypadController } from "./ui/keypad.js";
import { createSettingsController } from "./ui/settingsMenu.js";

function showWebGLErrorModal() {
  const startScreen = document.getElementById("start-screen");
  if (startScreen) startScreen.classList.add("hidden");

  let modal = document.getElementById("webgl-error-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "webgl-error-modal";
    modal.innerHTML = `
      <div class="webgl-error-card">
        <div class="webgl-error-badge">LỖI ĐỒ HỌA WEBGL</div>
        <h2 class="webgl-error-heading">Không thể khởi tạo đồ họa 3D (WebGL)</h2>
        <p class="webgl-error-msg">
          Trình duyệt của bạn đang tắt tính năng <strong>Tăng tốc phần cứng (Hardware Acceleration)</strong> hoặc GPU bị chặn (<code>GL_VENDOR = Disabled</code>).
        </p>

        <div class="webgl-steps-box">
          <div class="webgl-steps-title">⚡ Hướng dẫn bật lại trong 10 giây:</div>
          <div class="webgl-step-item">
            <strong>Bước 1:</strong> Mở Cài đặt trình duyệt (Chrome/Edge/Cốc Cốc), vào mục <strong>Hệ thống (System)</strong> hoặc truy cập:
            <div class="webgl-code-copy">chrome://settings/system</div>
          </div>
          <div class="webgl-step-item">
            <strong>Bước 2:</strong> Bật tùy chọn <strong>"Sử dụng tính năng tăng tốc đồ họa khi khả dụng"</strong> (Use graphics acceleration when available).
          </div>
          <div class="webgl-step-item">
            <strong>Bước 3:</strong> Bấm nút <strong>Khởi động lại (Relaunch)</strong> trình duyệt.
          </div>
          <div class="webgl-step-item">
            <em>Nếu vẫn chưa được:</em> Truy cập <code>chrome://flags/#ignore-gpu-blocklist</code> &rarr; chọn <strong>Enabled</strong> &rarr; Relaunch.
          </div>
        </div>

        <div class="webgl-btn-row">
          <button class="wake-btn" onclick="window.location.reload()">Tải lại trang (F5)</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function createSafeWebGLRenderer(initialPreset, initWidth, initHeight) {
  const configs = [
    // 1. Ưu tiên GPU rời hiệu năng cao trước (tắt antialias khi preset thấp)
    {
      antialias: initialPreset.shadows,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    },
    // 2. Default power preference (cho phép integrated GPU hoặc SwiftShader fallback)
    {
      antialias: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    },
    // 3. Low power
    {
      antialias: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    },
    // 4. Default minimal Three.js parameters
    {
      antialias: false,
      precision: "mediump",
      failIfMajorPerformanceCaveat: false,
    },
    {},
  ];

  for (let i = 0; i < configs.length; i++) {
    try {
      const r = new THREE.WebGLRenderer(configs[i]);
      if (r && r.getContext()) {
        return r;
      }
    } catch (e) {
      console.warn(`[WebGL] Init attempt ${i + 1} failed:`, e?.message || e);
    }
  }

  // 5. Thử tạo WebGL context thủ công qua canvas
  const canvas = document.createElement("canvas");
  canvas.width = initWidth;
  canvas.height = initHeight;
  const contextTypes = ["webgl2", "webgl", "experimental-webgl"];
  const contextAttrs = [
    { powerPreference: "default", failIfMajorPerformanceCaveat: false },
    { failIfMajorPerformanceCaveat: false },
    {},
  ];

  for (const type of contextTypes) {
    for (const attrs of contextAttrs) {
      try {
        const gl = canvas.getContext(type, attrs);
        if (gl) {
          const r = new THREE.WebGLRenderer({
            canvas,
            context: gl,
            antialias: false,
          });
          if (r && r.getContext()) {
            return r;
          }
        }
      } catch (e) {
        console.warn(`[WebGL] Manual ${type} failed:`, e?.message || e);
      }
    }
  }

  return null;
}

function initGame() {
  const isDevBuild = Boolean(import.meta.env && import.meta.env.DEV);
  if (!isDevBuild) {
    document.querySelectorAll('[data-dev-only="true"]').forEach((el) => {
      el.style.display = "none";
    });
  }

  // =========================================================
  // 1. DOM REFERENCES
  // =========================================================
  const container = document.getElementById("canvas-container");
  const loopLabel = document.getElementById("loop-label");
  const fpsBadge = document.getElementById("fps-badge");
  const anomalyPill = document.getElementById("anomaly-pill");
  const anomalyLabel = document.getElementById("anomaly-label");
  const objectiveText = document.getElementById("objective-text");
  const objectiveToast = document.getElementById("objective-toast");
  let objectiveFadeTimer = null;
  function flashObjectiveToast(durationMs = 5200) {
    if (!objectiveToast) return;
    objectiveToast.classList.add("visible");
    if (objectiveFadeTimer) clearTimeout(objectiveFadeTimer);
    objectiveFadeTimer = setTimeout(() => {
      objectiveToast.classList.remove("visible");
    }, durationMs);
  }
  if (objectiveText && typeof MutationObserver !== "undefined") {
    const objObserver = new MutationObserver(() => {
      if (objectiveText.textContent && objectiveText.textContent.trim()) {
        flashObjectiveToast(5200);
      }
    });
    objObserver.observe(objectiveText, { childList: true, characterData: true, subtree: true });
  }
  const fearBar = document.getElementById("fear-bar");
  const fearPct = document.getElementById("fear-pct");
  const matchCountEl = document.getElementById("match-count");
  const matchBar = document.getElementById("match-bar");
  const fearVignette = document.getElementById("fear-vignette");
  const dangerPulse = document.getElementById("danger-pulse");
  const panicOverlay = document.getElementById("panic-overlay");
  const lightWhiteout = document.getElementById("light-whiteout");
  const chaseBanner = document.getElementById("chase-banner");
  const blinkOverlay = document.getElementById("blink-overlay");
  const blinkClock = document.getElementById("blink-clock");
  const blinkSub = document.getElementById("blink-sub");
  const crosshair = document.getElementById("crosshair");
  const interactPrompt = document.getElementById("interact-prompt");
  const hplHint = document.getElementById("hpl-hint");
  const subtitleBox = document.getElementById("subtitle-box");
  const subtitleSpeaker = document.getElementById("subtitle-speaker");
  const subtitleText = document.getElementById("subtitle-text");
  const startScreen = document.getElementById("start-screen");
  const introScreen = document.getElementById("intro-screen");
  const introLine1 = document.getElementById("intro-line-1");
  const introLine2 = document.getElementById("intro-line-2");
  const introLine3 = document.getElementById("intro-line-3");
  const introSkipBtn = document.getElementById("intro-skip");
  const eyelidTop = document.getElementById("eyelid-top");
  const eyelidBottom = document.getElementById("eyelid-bottom");
  const eyeHaze = document.getElementById("eye-haze");
  const journalScreen = document.getElementById("journal-screen");
  const journalList = document.getElementById("journal-list");
  const journalTimeline = document.getElementById("journal-timeline");
  const journalChoices = document.getElementById("journal-choices");
  const choiceScreen = document.getElementById("choice-screen");
  const choiceKicker = document.getElementById("choice-kicker");
  const choiceTitle = document.getElementById("choice-title");
  const choicePrompt = document.getElementById("choice-prompt");
  const btnChoiceA = document.getElementById("btn-choice-a");
  const btnChoiceB = document.getElementById("btn-choice-b");
  const choiceALabel = document.getElementById("choice-a-label");
  const choiceASub = document.getElementById("choice-a-sub");
  const choiceBLabel = document.getElementById("choice-b-label");
  const choiceBSub = document.getElementById("choice-b-sub");
  const endingChoicesSummary = document.getElementById(
    "ending-choices-summary",
  );
  const endingScreen = document.getElementById("ending-screen");
  const endingKicker = document.getElementById("ending-kicker");
  const endingTitle = document.getElementById("ending-title");
  const endingBody = document.getElementById("ending-body");
  const endingBadge = document.getElementById("ending-badge");
  const endingPhone = document.getElementById("ending-phone");
  const endingPhoneTime = document.getElementById("ending-phone-time");
  const endingPhoneDate = document.getElementById("ending-phone-date");
  const endingPhoneIcon = document.getElementById("ending-phone-icon");
  const endingPhoneTitle = document.getElementById("ending-phone-title");
  const endingPhoneBar = document.getElementById("ending-phone-bar");
  const btnRetryLoop = document.getElementById("btn-retry-loop");
  const voiceSelect = document.getElementById("voice-select");
  const foleyPanel = document.getElementById("foley-panel");
  const btnFoley = document.getElementById("btn-foley");
  const settingsScreen = document.getElementById("settings-screen");
  const gfxDescEl = document.getElementById("gfx-desc");
  const toggleShowFps = document.getElementById("toggle-show-fps");
  const toggleCamSmooth = document.getElementById("toggle-cam-smooth");
  const sliderSens = document.getElementById("slider-sens");
  const sensDisplay = document.getElementById("sens-display");
  const keypadScreen = document.getElementById("keypad-screen");
  const keypadDisplay = document.getElementById("keypad-display");
  const keypadMsg = document.getElementById("keypad-msg");

  // =========================================================
  // 2. THREE.JS SCENE, CAMERA, RENDERER & AUDIO INITIALIZATION
  // =========================================================
  const settings = loadSettings();
  const audio = new HouseAudio();
  const timers = createTimerManager();
  const pauseOverlay = document.getElementById("pause-overlay");
  const btnContinue = document.getElementById("btn-continue");
  const btnStart = document.getElementById("btn-start");
  const btnResume = document.getElementById("btn-resume");
  const btnPauseSettings = document.getElementById("btn-pause-settings");
  const btnPauseTitle = document.getElementById("btn-pause-title");
  const state = createGameState();
  const hudCache = createHudCache();
  const shadowEvent = createShadowEventState();
  const hplGrab = createHplPhysicsState();

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06080c, 0.105);

  const initWidth = Math.max(
    1,
    container.clientWidth || window.innerWidth || 1280,
  );
  const initHeight = Math.max(
    1,
    container.clientHeight || window.innerHeight || 720,
  );
  const camera = new THREE.PerspectiveCamera(
    66,
    initWidth / initHeight,
    0.08,
    65,
  );
  scene.add(camera);

  const initialPreset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;
  const renderer = createSafeWebGLRenderer(initialPreset, initWidth, initHeight);
  if (!renderer) {
    showWebGLErrorModal();
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = initialPreset.exposure;
  renderer.shadowMap.enabled = initialPreset.shadows;
  renderer.shadowMap.type = initialPreset.shadowType;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, initialPreset.maxDpr),
  );
  renderer.setSize(initWidth, initHeight, false);
  container.appendChild(renderer.domElement);

  // =========================================================
  // 3. WORLD BUILDING & SYSTEMS
  // =========================================================
  const materials = createMaterials();
  const colliders = [];
  const interactables = [];

  const house = createHouse(
    scene,
    materials,
    colliders,
    interactables,
    () => state,
  );
  const doorsSystem = createDoorsSystem(
    scene,
    materials,
    colliders,
    interactables,
    () => state,
  );
  const doors = doorsSystem.doors;
  const puzzles = createPuzzlesSystem(
    scene,
    materials,
    interactables,
    () => state,
  );
  const shadow = createShadowPresence(scene, materials);

  // Player systems attached to camera
  const matchSystem = createMatchSystem(scene, camera);
  const heldPaperSystem = createHeldPaperSystem(camera, materials.heldPaperMat);

  // Narrator & subtitles
  const narrator = createNarrator(voiceSelect, audio);
  const subtitleSystem = createSubtitleSystem(
    { subtitleBox, subtitleSpeaker, subtitleText },
    narrator,
    state,
  );
  const showSubtitle = subtitleSystem.showSubtitle;

  // Keypad & Settings UI controllers
  let keypadController;
  let settingsController;

  // Complete execution context for modules
  const _playerRight = new THREE.Vector3();
  const ctx = {
    state,
    audio,
    timers,
    scene,
    camera,
    renderer,
    settings,
    colliders,
    interactables,
    doors,
    candles: puzzles.candles,
    hplDrawers: puzzles.hplDrawers,
    hplProps: puzzles.hplProps,
    objects: house.objects,
    lights: house.lights,
    puzzles,
    keyGlint: puzzles.keyGlint,
    matchboxGlint: puzzles.matchboxGlint,
    materials,
    tvStaticTex,
    shadow,
    shadowEvent,
    hplGrab,
    hudCache,
    matchGroup: matchSystem.matchGroup,
    matchLight: matchSystem.matchLight,
    flameMesh: matchSystem.flameMesh,
    flameSprite: matchSystem.flameSprite,
    glowHalo: matchSystem.glowHalo,
    heldPaperGroup: heldPaperSystem.heldPaperGroup,
    heldPaperMesh: heldPaperSystem.heldPaperMesh,
    eyelidTop,
    eyelidBottom,
    eyeHaze,
    panicOverlay,
    dangerPulse,
    chaseBanner,
    lightWhiteout,
    blinkOverlay,
    blinkClock,
    blinkSub,
    crosshair,
    interactPrompt,
    hplHint,
    subtitleBox,
    subtitleSpeaker,
    subtitleText,
    startScreen,
    introScreen,
    introLine1,
    introLine2,
    introLine3,
    introSkipBtn,
    journalScreen,
    journalList,
    journalTimeline,
    journalChoices,
    choiceScreen,
    choiceKicker,
    choiceTitle,
    choicePrompt,
    btnChoiceA,
    btnChoiceB,
    choiceALabel,
    choiceASub,
    choiceBLabel,
    choiceBSub,
    endingScreen,
    endingBadge,
    endingTitle,
    endingKicker,
    endingBody,
    endingPhone,
    endingPhoneTime,
    endingPhoneDate,
    endingPhoneIcon,
    endingPhoneTitle,
    endingPhoneBar,
    endingChoicesSummary,
    btnRetryLoop,
    foleyPanel,
    btnFoley,
    keypadScreen,
    keypadDisplay,
    keypadMsg,
    settingsScreen,
    fpsBadge,
    container,
    portraitGroup: house.objects.portraitGroup,
    portraitAnomalyObj: house.objects.portraitAnomalyObj,
    livingWindowMoon: house.lights.livingWindowMoon,
    emergencyRedLight: house.lights.emergencyRedLight,
    alleyLights: house.lights.alleyLights,
    objectiveText,
    anomalyPill,
    anomalyLabel,
    playerRight: _playerRight,
    showSubtitle,
    narrator,
    clearKeys: () => clearKeys(),
    clearInteractUI: () =>
      clearInteractUI(hudCache, { crosshair, interactPrompt }),
    updateHUD: () =>
      updateHUD(state, hudCache, {
        loopLabel,
        fearPct,
        fearBar,
        fearVignette,
        matchCountEl,
        matchBar,
        anomalyPill,
        anomalyLabel,
      }),
    renderJournal: () =>
      renderJournal(state, { journalList, journalTimeline, journalChoices }),
    toggleJournal: () =>
      toggleJournal(
        state,
        { journalScreen, settingsScreen, pauseOverlay },
        () =>
          renderJournal(state, {
            journalList,
            journalTimeline,
            journalChoices,
          }),
        clearKeys,
      ),
    releaseHplGrab: (throwProp = false) =>
      releaseHplGrab(
        hplGrab,
        throwProp,
        camera,
        audio,
        crosshair,
        hplHint,
        puzzles.breakerLeverPivot,
        state,
      ),
    triggerTrueEnding: (type = null) => triggerTrueEnding(type, ctx),
    setupLoopEnvironment: (loopNum) => {
      flashObjectiveToast(5500);
      if (house.objects.tvObj) house.objects.tvObj.checkedInLoop = 0;
      return setupLoopEnvironment(loopNum, ctx);
    },
    advanceVoicemailSequence: () => advanceVoicemailSequence(ctx),
    recordAnomalyFound: () => recordAnomalyFound(ctx),
    openChoiceModal: (loopNum) => openChoiceModal(loopNum, ctx),
    resolveMoralChoice: (kind) => resolveMoralChoice(kind, ctx),
    transitionToLoop: (nextLoop) => transitionToLoop(nextLoop, ctx),
    openHeldPaper: (kind, loopNum) => openHeldPaperUI(kind, loopNum),
    lowerHeldPaper: () => lowerHeldPaperUI(),
  };

  // Wire Keypad Controller
  keypadController = createKeypadController(
    { keypadScreen, keypadDisplay, keypadMsg, settingsScreen, journalScreen },
    state,
    audio,
    {
      clearKeys,
      onCodeSuccess: () => {
        puzzles.clueGroup.visible = false;
        audio.playMemoryChime(true);
        state.journalNotes.push({
          title: `Vòng 5 — ${LOOP_STORY[5].clueTitle}`,
          text: LOOP_STORY[5].journal,
        });
        renderJournal(state, { journalList, journalTimeline, journalChoices });
        openHeldPaperUI("clue", 5);
      },
    },
  );

  // Wire Settings Controller
  settingsController = createSettingsController(
    {
      container,
      settingsScreen,
      journalScreen,
      fpsBadge,
      gfxDescEl,
      toggleShowFps,
      toggleCamSmooth,
      sliderSens,
      sensDisplay,
    },
    settings,
    GFX_PRESETS,
    renderer,
    scene,
    {
      matchLight: matchSystem.matchLight,
      bedroomLampLight: house.lights.bedroomLampLight,
    },
    house.objects.dustPoints,
    materials,
    () => saveSettings(settings),
    state,
    {
      clearKeys,
      onReset: () => {
        Object.assign(settings, DEFAULT_SETTINGS);
        saveSettings(settings);
      },
    },
  );

  settingsController.applyAllSettings();

  // =========================================================
  // 4. HELD PAPER & CLUE INSPECTION
  // =========================================================
  function openHeldPaperUI(kind, loopNum) {
    if (materials.heldPaperMat.map) materials.heldPaperMat.map.dispose();
    materials.heldPaperMat.map = makeHeldPaperTexture(kind, loopNum);
    materials.heldPaperMat.needsUpdate = true;
    state.holdingPaper = true;
    state.holdingPaperSource = kind;
    state.paperAnim = 0;
    heldPaperSystem.heldPaperGroup.visible = true;
    matchSystem.matchGroup.visible = false;
    crosshair.style.opacity = "0";
    subtitleBox.classList.remove("visible");
    clearInteractUI(hudCache, { crosshair, interactPrompt });

    const content = getHeldPaperContent(kind, loopNum);
    if (content && content.voice) {
      narrator.speak(content.voice, kind === "fridge_note");
    }
  }

  function lowerHeldPaperUI() {
    if (!state.holdingPaper) return;
    const src = state.holdingPaperSource;
    state.holdingPaper = false;
    state.holdingPaperSource = null;
    crosshair.style.opacity = "";
    if (state.matchTimer > 0) matchSystem.matchGroup.visible = true;
    interactPrompt.classList.remove("visible");
    narrator.stop();

    if (src !== "clue") return;

    if (state.loop === 1) {
      objectiveText.textContent = "Ra mở cửa chính đón cô ấy";
    } else if (state.loop === 2) {
      objectiveText.textContent = "Ra mở cửa chính cuối phòng khách";
      timers.setTimeout(() => {
        if (state.loop !== 2 || state.ended) return;
        audio.playBreakerSnap();
        house.lights.bedroomLampLight.intensity = 0;
        house.lights.studyLampLight.intensity = 0;
        state.matchTimer = 0;
        matchSystem.matchGroup.visible = false;
        matchSystem.matchLight.intensity = 0;
        puzzles.candles.forEach((c) => {
          c.lit = false;
          c.flame.visible = false;
          c.light.intensity = 0;
        });
        shadowEvent.mode = "loop2_doorway";
        shadowEvent.timer = 0;
        shadow.group.position.set(3.8, 0, -4.5);
        shadow.group.visible = true;
        audio.playHeavyBreath(0.32);
      }, 900);
    } else if (state.loop === 3 || state.loop === 4) {
      objectiveText.textContent = "Ra mở cửa chính để bước sang vòng tiếp theo";
      if (state.loop === 4) {
        shadowEvent.mode = "loop3_front";
        shadow.group.position.set(0, 0, -8.5);
        shadow.group.visible = true;
        audio.playHeavyBreath(0.3);
      }
    } else if (state.loop === TOTAL_LOOPS) {
      objectiveText.textContent = "Giữ [Shift] chạy thẳng ra Cửa chính!";
      chaseBanner.classList.add("visible");
      audio.triggerDeadSilence(1500);
      audio.playScareChord();
      audio.playDoorSlam();
      const frontDoor = doors.find((d) => d.id === "door_front");
      if (frontDoor) {
        frontDoor.isOpen = true;
        frontDoor.targetOffset = -Math.PI * 0.55;
        frontDoor.collider.active = false;
      }
      house.lights.dawnLight.intensity = 6.2;
      if (house.lights.livingWindowMoon) {
        house.lights.livingWindowMoon.color.setHex(0xffd28a);
        house.lights.livingWindowMoon.intensity = 2.4;
      }
      shadowEvent.mode = "loop3_chase";
      shadow.group.position.set(0.2, 0, -1.6);
      shadow.group.visible = true;
      state.shakeTime = 0.6;
      showSubtitle(
        LOOP_STORY.loop3Chase.speaker,
        LOOP_STORY.loop3Chase.text,
        7400,
        false,
      );
    }
  }

  function completeBreakerFix() {
    if (state.breakerFixed) return;
    state.breakerFixed = true;
    puzzles.breakerLeverPivot.rotation.x = 0.35;
    materials.breakerLedMat.color.setHex(0x38d97c);
    puzzles.breakerLight.intensity = 0.35;
    puzzles.breakerLight.color.setHex(0x38d97c);
    house.lights.kitchenGuideLight.intensity = 0;
    audio.playBreakerSnap();
    house.lights.bedroomLampLight.intensity = 0.95;
    house.lights.studyLampLight.intensity = 0.75;
    house.lights.bathLight.intensity = 0.62;
    objectiveText.textContent = house.objects.phoneObj.answered
      ? "Điện đã có lại → vào phòng làm việc xem hồ sơ"
      : "Điện đã có lại → nghe điện thoại bàn rồi vào phòng làm việc";
    showSubtitle(
      "Cầu dao điện",
      "Cần cầu dao bật lên rồi — đèn trong nhà đã sáng lại. Giờ có thể vào phòng làm việc xem hồ sơ.",
      5200,
    );
  }

  // =========================================================
  // 5. RAYCAST INTERACTION CHECK & EXECUTION
  // =========================================================
  const _camDir = new THREE.Vector3();
  const _toItem = new THREE.Vector3();
  let currentTarget = null;

  function findInteractable() {
    camera.getWorldDirection(_camDir);
    let best = null;
    let bestDist = 3.0;

    for (let i = 0; i < interactables.length; i++) {
      const item = interactables[i];
      if (item.type === "clue" && state.loopClueFound) continue;
      if (item.type === "candle" && item.lit) continue;
      if (item.type === "phone" && !item.ringing) continue;
      if (item.type === "wardrobe" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "mirror" && item.checkedInLoop === state.loop) continue;
      if (item.type === "bath_mirror" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "fridge" && item.checkedInLoop === state.loop) continue;
      if (item.type === "kitchen_note" && item.readInLoop === state.loop)
        continue;
      if (item.type === "kitchen_faucet" && !item.running && !item.dripping)
        continue;
      if (item.type === "bath_faucet" && !item.running && !item.dripping)
        continue;
      if (
        item.type === "study_key" &&
        (state.loop !== 1 || state.studyKeyFound)
      )
        continue;
      if (item.type === "breaker" && (state.loop !== 2 || state.breakerFixed))
        continue;
      if (item.type === "clock_anomaly" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "chair_anomaly" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "portrait_anomaly" && item.checkedInLoop === state.loop)
        continue;
      if (
        item.type === "scrawl_anomaly" &&
        (!house.objects.wallScrawl.visible || item.checkedInLoop === state.loop)
      )
        continue;
      if (item.type === "smartphone" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "broken_mug" && item.checkedInLoop === state.loop)
        continue;
      if (
        item.type === "rain_puddle" &&
        (!house.objects.doorRainPuddle.visible ||
          item.checkedInLoop === state.loop)
      )
        continue;
      if (
        item.type === "matchbox" &&
        (state.loop < 2 || item.pickedInLoop === state.loop)
      )
        continue;
      if (
        item.type === "tv" &&
        (state.loop < 2 || item.checkedInLoop === state.loop)
      )
        continue;

      _toItem.subVectors(item.worldPos, state.pos);
      const dist = _toItem.length();
      if (dist > bestDist) continue;
      _toItem.divideScalar(dist || 1);
      if (_camDir.dot(_toItem) > 0.68) {
        best = item;
        bestDist = dist;
      }
    }
    return best;
  }

  function triggerInteract() {
    if (!state.running || state.paused || state.ended || state.wakingTimer > 0)
      return;
    audio.init();
    if (shadowEvent.voicemailHold) {
      advanceVoicemailSequence(ctx);
      return;
    }
    if (state.holdingPaper) {
      lowerHeldPaperUI();
      return;
    }
    if (!currentTarget) return;

    if (
      currentTarget.type === "matchbox" &&
      state.loop >= 2 &&
      currentTarget.pickedInLoop !== state.loop
    ) {
      currentTarget.pickedInLoop = state.loop;
      puzzles.matchboxGroup.visible = false;
      state.matchesLeft = Math.min(12, state.matchesLeft + 3);
      audio.playMatchStrike();
      showSubtitle(
        "Hộp diêm",
        `Nhặt thêm 3 que diêm (hiện có ${state.matchesLeft} que).`,
        3600,
        false,
        true,
      );
      ctx.updateHUD();
    } else if (currentTarget.type === "tv") {
      currentTarget.checkedInLoop = state.loop;
      audio.playBreakerSnap();
      audio.playHeavyBreath(0.22);
      const tvLines = {
        2: {
          speaker: "Màn hình TV nhiễu hạt",
          text: "TV tự bật lúc mất điện... Giữa màn nhiễu trắng lờ mờ hiện bóng một con hẻm mưa lúc 02:14.",
        },
        3: {
          speaker: "Màn hình TV nhiễu hạt",
          text: "Bản tin thời tiết từ ngày 14/11 cứ phát lặp lại không ngừng — chiếc TV này đã kẹt ở đêm đó suốt nhiều tuần.",
        },
        4: {
          speaker: "Màn hình TV nhiễu hạt",
          text: "Âm thanh nhiễu rè xen lẫn tiếng gõ cửa dồn dập... Không phải TV hư, là ký ức của mình đang phát lại.",
        },
        5: {
          speaker: "Màn hình TV nhiễu hạt",
          text: "Màn hình chớp tắt theo nhịp đèn xe cấp cứu ngoài cửa sổ. Mọi thứ trong căn nhà này đều dừng lại lúc 02:14.",
        },
      };
      const info = tvLines[state.loop] || tvLines[2];
      showSubtitle(info.speaker, info.text, 5600, state.loop >= 4);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "broken_mug") {
      currentTarget.checkedInLoop = state.loop;
      audio.playFloorCreak();
      const info =
        state.loop === 1 ? LOOP_STORY.brokenMug[1] : LOOP_STORY.brokenMug[2];
      showSubtitle(info.speaker, info.text, 5400);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "rain_puddle") {
      currentTarget.checkedInLoop = state.loop;
      audio.playWaterDrip();
      const info =
        state.loop <= 2 ? LOOP_STORY.rainPuddle[2] : LOOP_STORY.rainPuddle[3];
      showSubtitle(info.speaker, info.text, 5400);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "smartphone") {
      currentTarget.checkedInLoop = state.loop;
      audio.playClockTick();
      if (state.loop === 1) {
        showSubtitle(
          "Điện thoại trên bàn",
          "Màn hình tối om, đồng hồ đứng ở 02:14 và báo Không có dịch vụ. Lạ thật, sao Alice không nhắn gì cả?",
          5600,
        );
      } else if (state.loop === 2) {
        showSubtitle(
          "Điện thoại trên bàn",
          "Vẫn là 02:14 không thông báo... nhưng góc máy có biểu tượng chuông gạch chéo. Mình bật Im lặng từ lúc nào?",
          5600,
        );
      } else if (state.loop === 3) {
        showSubtitle(
          "Màn hình sáng đỏ · 02:08",
          "4 cuộc gọi nhỡ từ Alice lúc 02:08 ngày 14/11 — khi máy đang bật Im lặng! Không phải kẻ lạ đâu...",
          5800,
          true,
        );
      } else {
        showSubtitle(
          "Tin nhắn thoại · 02:09",
          "Màn hình hiện 1 tin nhắn thoại dài 34 giây từ Alice gửi lúc 02:09, ngay sau khi cô ấy gõ cửa mà không ai mở.",
          6000,
        );
      }
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "clock_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playClockTick();
      const info =
        LOOP_STORY.anomalyClock[state.loop] || LOOP_STORY.anomalyClock[1];
      showSubtitle(info.speaker, info.text, 5200);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "chair_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playFloorCreak();
      const info =
        LOOP_STORY.anomalyChair[state.loop] || LOOP_STORY.anomalyChair[1];
      showSubtitle(info.speaker, info.text, 5200);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "portrait_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playHeavyBreath(0.2);
      const info =
        LOOP_STORY.anomalyPortrait[state.loop] || LOOP_STORY.anomalyPortrait[1];
      showSubtitle(info.speaker, info.text, 5200);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "scrawl_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playWoodScratch(3);
      const info =
        LOOP_STORY.anomalyScrawl[state.loop] || LOOP_STORY.anomalyScrawl[2];
      showSubtitle(info.speaker, info.text, 5400, true);
      ctx.recordAnomalyFound();
    } else if (
      currentTarget.type === "study_key" &&
      state.loop === 1 &&
      !state.studyKeyFound
    ) {
      state.studyKeyFound = true;
      puzzles.studyKeyGroup.visible = false;
      audio.playMemoryChime(false);
      objectiveText.textContent =
        "Đã có chìa khóa → mở cửa phòng làm việc bên phải";
      showSubtitle(
        "Chìa khóa đồng",
        "Tìm thấy chìa khóa phòng làm việc rồi. Ra mở cửa bên phải phòng khách xem thử.",
        4800,
      );
    } else if (
      currentTarget.type === "breaker" &&
      state.loop === 2 &&
      !state.breakerFixed
    ) {
      completeBreakerFix();
    } else if (currentTarget.type === "bath_mirror") {
      currentTarget.checkedInLoop = state.loop;
      ctx.recordAnomalyFound();
      if (state.loop === 1) {
        audio.playHeavyBreath(0.18);
        showSubtitle(
          LOOP_STORY.bathMirror1.speaker,
          LOOP_STORY.bathMirror1.text,
          5600,
        );
      } else if (state.loop === 2) {
        audio.playGlassCrack();
        audio.playScareChord();
        materials.bathMirrorMat.map = materials.bathMirrorGhostTex;
        materials.bathMirrorMat.needsUpdate = true;
        state.shakeTime = 0.45;
        state.fear = Math.min(95, state.fear + 26);
        showSubtitle(
          LOOP_STORY.bathMirror2.speaker,
          LOOP_STORY.bathMirror2.text,
          6000,
          true,
        );
        timers.setTimeout(() => {
          materials.bathMirrorMat.map = materials.bathMirrorFogTex;
          materials.bathMirrorMat.needsUpdate = true;
        }, 650);
      } else {
        audio.playHeavyBreath(0.24);
        showSubtitle(
          LOOP_STORY.bathMirror3.speaker,
          LOOP_STORY.bathMirror3.text,
          6000,
        );
      }
    } else if (currentTarget.type === "bath_faucet") {
      const wasRunning = currentTarget.running;
      currentTarget.running = false;
      currentTarget.dripping = false;
      house.objects.bathWaterMesh.visible = false;
      audio.playFaucetToggle(true);
      const info = wasRunning ? LOOP_STORY.bathFaucet2 : LOOP_STORY.bathFaucet1;
      showSubtitle(info.speaker, info.text, 5400, wasRunning);
    } else if (currentTarget.type === "kitchen_faucet") {
      const wasRunning = currentTarget.running;
      currentTarget.running = false;
      currentTarget.dripping = false;
      house.objects.kitchenWaterMesh.visible = false;
      audio.playFaucetToggle(true);
      const info = wasRunning
        ? LOOP_STORY.kitchenFaucet2
        : LOOP_STORY.kitchenFaucet1;
      showSubtitle(info.speaker, info.text, 5400, wasRunning);
    } else if (currentTarget.type === "fridge") {
      currentTarget.checkedInLoop = state.loop;
      ctx.recordAnomalyFound();
      audio.playDoorCreak(false);
      if (state.loop === 1) {
        house.objects.fridgeObj.targetAngle = 0.85;
        showSubtitle(LOOP_STORY.fridge1.speaker, LOOP_STORY.fridge1.text, 5800);
      } else if (state.loop === 2) {
        house.objects.fridgeObj.targetAngle = 0.08;
        house.lights.fridgeLight.intensity = 0.05;
        state.fear = Math.min(95, state.fear + 18);
        audio.playBreakerSnap();
        showSubtitle(
          LOOP_STORY.fridge2.speaker,
          LOOP_STORY.fridge2.text,
          5800,
          true,
        );
        timers.setTimeout(() => {
          if (state.loop === 2) house.lights.fridgeLight.intensity = 0.85;
        }, 1100);
      } else {
        house.objects.fridgeObj.targetAngle = 1.35;
        audio.playHeavyBreath(0.25);
        openHeldPaperUI("fridge_note", state.loop);
      }
    } else if (currentTarget.type === "kitchen_note") {
      currentTarget.readInLoop = state.loop;
      audio.playMemoryChime(false);
      const key =
        state.loop === 1
          ? "kitchenNote1"
          : state.loop <= 3
            ? "kitchenNote2"
            : "kitchenNote3";
      const info = LOOP_STORY[key];
      state.journalNotes.push({ title: info.title, text: info.journal });
      renderJournal(state, { journalList, journalTimeline, journalChoices });
      openHeldPaperUI("kitchen_note", state.loop);
    } else if (currentTarget.type === "mirror") {
      currentTarget.checkedInLoop = state.loop;
      ctx.recordAnomalyFound();
      if (state.loop === 1) {
        audio.playHeavyBreath(0.2);
        showSubtitle(LOOP_STORY.mirror1.speaker, LOOP_STORY.mirror1.text, 5600);
      } else {
        audio.playGlassCrack();
        audio.playScareChord();
        materials.mirrorMat.map = materials.mirrorGhostTex;
        materials.mirrorMat.needsUpdate = true;
        state.shakeTime = 0.5;
        state.fear = Math.min(95, state.fear + 30);
        showSubtitle(
          LOOP_STORY.mirror2.speaker,
          LOOP_STORY.mirror2.text,
          5800,
          true,
        );
        timers.setTimeout(() => {
          materials.mirrorMat.map = materials.mirrorCrackedTex;
          materials.mirrorMat.needsUpdate = true;
        }, 650);
      }
    } else if (currentTarget.type === "wardrobe") {
      currentTarget.checkedInLoop = state.loop;
      if (state.loop === 1) {
        audio.playWardrobeCreak(false);
        house.objects.wardrobeObj.targetAngle = -0.45;
        showSubtitle(
          LOOP_STORY.wardrobe1.speaker,
          LOOP_STORY.wardrobe1.text,
          5600,
        );
      } else if (state.loop === 2) {
        audio.playScareChord();
        audio.playWardrobeSlam();
        house.objects.wardrobeObj.targetAngle = 0;
        house.objects.wardrobeDoorPivot.rotation.y = 0;
        house.objects.wardrobeEyes.visible = false;
        state.shakeTime = 0.45;
        state.fear = Math.min(95, state.fear + 28);
        showSubtitle(
          LOOP_STORY.wardrobe2.speaker,
          LOOP_STORY.wardrobe2.text,
          5800,
          true,
        );
      } else {
        audio.playWoodScratch(4);
        audio.playHeavyBreath(0.32);
        showSubtitle(
          LOOP_STORY.wardrobe3.speaker,
          LOOP_STORY.wardrobe3.text,
          5800,
          true,
        );
      }
    } else if (currentTarget.type === "phone" && currentTarget.ringing) {
      currentTarget.ringing = false;
      currentTarget.answered = true;
      house.objects.phoneLed.intensity = 0;
      audio.playBreakerSnap();
      audio.playHeavyBreath(0.28);
      showSubtitle(
        LOOP_STORY.phoneCall.speaker,
        LOOP_STORY.phoneCall.text,
        7000,
        true,
      );
      state.journalNotes.push({
        title: `Vòng ${state.loop} — Cuộc gọi từ điện thoại bàn`,
        text:
          state.loop === 2
            ? "Điện thoại bàn tự đổ chuông dù dây đã rút. Đầu dây bên kia là giọng Alice giữa tiếng mưa lớn ở đầu hẻm lúc 02:14..."
            : "Vòng 4: Điện thoại lại réo vang giữa đêm. Giọng Alice đứt quãng giữa tiếng nhiễu rè, trách mình vì sao khóa cửa không nghe máy.",
      });
      renderJournal(state, { journalList, journalTimeline, journalChoices });
      ctx.recordAnomalyFound();
      if (state.loop === 2 && !state.breakerFixed) {
        objectiveText.textContent =
          "Vào Nhà bếp bật Hộp cầu dao điện rồi kiểm tra bàn làm việc";
      } else if (state.anomaliesFound >= state.anomaliesRequired) {
        objectiveText.textContent =
          "Vào phòng làm việc bên phải xem manh mối trên bàn";
      }
    } else if (currentTarget.type === "candle" && !currentTarget.lit) {
      if (state.matchTimer <= 0) {
        if (state.matchesLeft > 0)
          toggleOrStrikeMatch(
            state,
            matchSystem.matchGroup,
            matchSystem.matchLight,
            audio,
            ctx.updateHUD,
            showSubtitle,
          );
        else {
          showSubtitle(
            "Không có lửa",
            "Phải quẹt diêm trước đã, rồi mới thắp được nến.",
            3000,
            false,
            true,
          );
          return;
        }
      }
      currentTarget.lit = true;
      currentTarget.flame.visible = true;
      currentTarget.light.intensity = 1.55;
      audio.playMatchStrike();
    } else if (currentTarget.type === "clue" && !state.loopClueFound) {
      if (state.anomaliesFound < state.anomaliesRequired) {
        const left = state.anomaliesRequired - state.anomaliesFound;
        audio.playDoorSlam();
        showSubtitle(
          "Chưa đủ điểm bất thường",
          `Căn nhà này vẫn còn ${left} điểm bất thường bạn chưa kiểm tra (đồng hồ, ghế ăn, khung ảnh, chữ tường, gương hoặc tủ lạnh).`,
          5400,
        );
        return;
      }
      if (state.loop === 2 && !state.breakerFixed) {
        audio.playDoorSlam();
        showSubtitle(
          "Mất điện tối om",
          "Đèn bàn làm việc tắt ngấm không nhìn rõ chữ... Cần vào Nhà bếp (bên trái phòng khách) bật lại Hộp cầu dao điện trước.",
          5200,
        );
        return;
      }
      if (state.loop === TOTAL_LOOPS && !state.codeUnlocked) {
        keypadController.openKeypad();
        return;
      }
      state.loopClueFound = true;
      puzzles.clueGroup.visible = false;
      const info = LOOP_STORY[state.loop];
      audio.playMemoryChime(state.loop === TOTAL_LOOPS);
      state.journalNotes.push({
        title: `Vòng ${state.loop} — ${info.clueTitle}`,
        text: info.journal,
      });
      renderJournal(state, { journalList, journalTimeline, journalChoices });
      openHeldPaperUI("clue", state.loop);
    } else if (currentTarget.type === "hpl_drawer") {
      const dr = currentTarget;
      dr.isOpen = !dr.isOpen;
      dr.targetDist = dr.isOpen ? dr.maxSlide : 0;
      audio.playDoorCreak(!dr.isOpen);
      if (dr.isOpen && dr.inspectedInLoop !== state.loop) {
        dr.inspectedInLoop = state.loop;
        showSubtitle("Ý nghĩ", dr.noteText, 4600);
      }
    } else if (currentTarget.type === "door") {
      if (currentTarget.isFrontDoor) {
        if (!state.loopClueFound) {
          audio.playDoorSlam();
          showSubtitle(
            "Cửa chính khóa chặt",
            LOOP_STORY[state.loop].doorLockedText,
            4800,
          );
          return;
        }
        if (state.loop < TOTAL_LOOPS) {
          if (state.loop === 1 || state.loop === 4) audio.playThreeKnocks();
          else audio.playDoorCreak(false);
          openChoiceModal(state.loop, ctx);
        } else {
          audio.playDoorCreak(false);
          currentTarget.isOpen = true;
          currentTarget.targetOffset = -Math.PI * 0.55;
          currentTarget.collider.active = false;
        }
        return;
      }
      if (
        currentTarget.id === "door_study" &&
        state.loop === 1 &&
        !state.studyKeyFound
      ) {
        audio.playDoorSlam();
        showSubtitle(
          "Cửa phòng làm việc đang khóa",
          "Mình đã khóa cửa phòng làm việc rồi... Thử tìm chiếc chìa khóa đồng quanh tủ ngăn kéo phòng ngủ, kệ sách phòng khách hoặc trong nhà bếp.",
          5400,
        );
        return;
      }
      const willClose = currentTarget.isOpen;
      currentTarget.isOpen = !currentTarget.isOpen;
      currentTarget.targetOffset = currentTarget.isOpen ? -Math.PI * 0.48 : 0;
      currentTarget.collider.active = !currentTarget.isOpen;
      audio.playDoorCreak(willClose);
    }
    ctx.updateHUD();
  }

  // =========================================================
  // 6. INPUT EVENT LISTENERS (KEYBOARD, MOUSE, TOUCH)
  // =========================================================
  window.addEventListener("keydown", (e) => {
    if (state.inIntro) {
      beginLoop1AfterIntro(ctx);
      return;
    }
    keys[e.code] = true;

    if (!choiceScreen.classList.contains("hidden")) {
      if (e.key === "1") {
        audio.init();
        resolveMoralChoice("confront", ctx);
        return;
      }
      if (e.key === "2") {
        audio.init();
        resolveMoralChoice("avoid", ctx);
        return;
      }
      return;
    }

    if (!keypadScreen.classList.contains("hidden")) {
      if (e.code === "Escape") {
        keypadController.closeKeypad();
        return;
      }
      if (e.code === "Backspace") {
        keypadController.pushKeypadDigit("backspace");
        return;
      }
      if (e.code === "Enter") {
        keypadController.submitKeypad();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        keypadController.pushKeypadDigit(e.key);
        return;
      }
      return;
    }

    if (e.code === "Escape") {
      if (!settingsScreen.classList.contains("hidden")) {
        settingsController.closeSettings();
        return;
      }
      if (!journalScreen.classList.contains("hidden")) {
        toggleJournal(
          state,
          { journalScreen, settingsScreen, pauseOverlay },
          () =>
            renderJournal(state, {
              journalList,
              journalTimeline,
              journalChoices,
            }),
          clearKeys,
        );
        return;
      }
      if (state.holdingPaper) {
        lowerHeldPaperUI();
        return;
      }
      if (pauseOverlay && !pauseOverlay.classList.contains("hidden")) {
        resumeFromPause();
        return;
      }
      if (state.running && !state.ended && !state.inIntro && !isAnyModalOpen()) {
        openPauseOverlay();
        return;
      }
    }

    if (e.code === "KeyO" && !state.ended) {
      settingsController.toggleSettings();
      return;
    }

    if (!state.running || state.ended) return;
    if (e.code === "KeyF")
      toggleOrStrikeMatch(
        state,
        matchSystem.matchGroup,
        matchSystem.matchLight,
        audio,
        ctx.updateHUD,
        showSubtitle,
      );
    if (
      e.code === "KeyG" &&
      hplGrab.active &&
      hplGrab.target &&
      hplGrab.target.type === "hpl_prop"
    ) {
      releaseHplGrab(
        hplGrab,
        true,
        camera,
        audio,
        crosshair,
        hplHint,
        puzzles.breakerLeverPivot,
        state,
      );
      return;
    }
    if (
      shadowEvent.voicemailHold &&
      (e.code === "KeyE" || e.code === "Space" || e.code === "Enter")
    ) {
      advanceVoicemailSequence(ctx);
      return;
    }
    if (e.code === "KeyE") triggerInteract();
    if (e.code === "KeyJ")
      toggleJournal(
        state,
        { journalScreen, settingsScreen, pauseOverlay },
        () =>
          renderJournal(state, {
            journalList,
            journalTimeline,
            journalChoices,
          }),
        clearKeys,
      );
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
  window.addEventListener("blur", clearKeys);

  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  subtitleBox.addEventListener("click", () => {
    if (shadowEvent.voicemailHold) advanceVoicemailSequence(ctx);
  });

  container.addEventListener("contextmenu", (e) => e.preventDefault());

  container.addEventListener("mousedown", (e) => {
    if (shadowEvent.voicemailHold) {
      advanceVoicemailSequence(ctx);
      return;
    }
    if (!state.running || state.paused || state.ended || state.holdingPaper)
      return;
    audio.init();

    if (e.button === 2) {
      if (
        hplGrab.active &&
        hplGrab.target &&
        hplGrab.target.type === "hpl_prop"
      ) {
        releaseHplGrab(
          hplGrab,
          true,
          camera,
          audio,
          crosshair,
          hplHint,
          puzzles.breakerLeverPivot,
          state,
        );
      }
      return;
    }

    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;

    // First click while unlocked acquires Pointer Lock only (avoids accidental HPL grab/throw)
    if (
      e.button === 0 &&
      container.requestPointerLock &&
      document.pointerLockElement !== container
    ) {
      try {
        container.requestPointerLock();
      } catch (_) {}
      return;
    }

    // All doors, drawers & breaker use crisp [E] interaction
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      isDragging = false;
      if (hplGrab.active) {
        releaseHplGrab(
          hplGrab,
          false,
          camera,
          audio,
          crosshair,
          hplHint,
          puzzles.breakerLeverPivot,
          state,
        );
      }
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.running || state.paused || state.ended || state.wakingTimer > 0)
      return;
    const sens = settings.sensitivity;
    let dx = 0;
    let dy = 0;

    if (document.pointerLockElement === container) {
      dx = e.movementX;
      dy = e.movementY;
    } else if (isDragging) {
      dx = e.clientX - lastX;
      dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    } else {
      return;
    }

    if (
      hplGrab.active &&
      hplGrab.target &&
      hplGrab.target.type !== "hpl_prop"
    ) {
      applyHplMouseDrag(
        dx,
        dy,
        hplGrab,
        settings,
        state,
        audio,
        puzzles.breakerLeverPivot,
        completeBreakerFix,
        (loop) => openChoiceModal(loop, ctx),
        showSubtitle,
      );
      return;
    }

    const mult = document.pointerLockElement === container ? 0.0022 : 0.0045;
    state.targetYaw -= dx * mult * sens;
    state.targetPitch = Math.max(
      -1.15,
      Math.min(1.15, state.targetPitch - dy * mult * sens),
    );
    if (!settings.camSmooth) {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
    }
  });

  // Touch Support
  let touchLookId = null;
  container.addEventListener(
    "touchstart",
    (e) => {
      if (!state.running || state.paused || state.ended) return;
      audio.init();
      if (touchLookId === null && e.changedTouches.length > 0) {
        touchLookId = e.changedTouches[0].identifier;
        lastX = e.changedTouches[0].clientX;
        lastY = e.changedTouches[0].clientY;
      }
    },
    { passive: true },
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (
        !state.running ||
        state.paused ||
        state.ended ||
        state.wakingTimer > 0
      )
        return;
      const sens = settings.sensitivity;
      for (const t of e.changedTouches) {
        if (t.identifier === touchLookId) {
          const dx = t.clientX - lastX;
          const dy = t.clientY - lastY;
          lastX = t.clientX;
          lastY = t.clientY;
          state.targetYaw -= dx * 0.0055 * sens;
          state.targetPitch = Math.max(
            -1.15,
            Math.min(1.15, state.targetPitch - dy * 0.0055 * sens),
          );
          if (!settings.camSmooth) {
            state.yaw = state.targetYaw;
            state.pitch = state.targetPitch;
          }
        }
      }
    },
    { passive: true },
  );

  container.addEventListener("touchend", (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchLookId) touchLookId = null;
    }
  });

  document.querySelectorAll(".pad-btn").forEach((btn) => {
    const code = btn.getAttribute("data-key");
    const down = (ev) => {
      ev.preventDefault();
      audio.init();
      keys[code] = true;
    };
    const up = (ev) => {
      ev.preventDefault();
      keys[code] = false;
    };
    btn.addEventListener("mousedown", down);
    btn.addEventListener("mouseup", up);
    btn.addEventListener("mouseleave", up);
    btn.addEventListener("touchstart", down, { passive: false });
    btn.addEventListener("touchend", up, { passive: false });
  });

  // Auto-save Continue Button & Auto-Pause Overlay helpers
  function isAnyModalOpen() {
    return (
      !startScreen.classList.contains("hidden") ||
      introScreen.classList.contains("active") ||
      !settingsScreen.classList.contains("hidden") ||
      !journalScreen.classList.contains("hidden") ||
      !keypadScreen.classList.contains("hidden") ||
      !choiceScreen.classList.contains("hidden") ||
      !endingScreen.classList.contains("hidden")
    );
  }

  function refreshContinueButton() {
    if (!btnContinue || !btnStart) return;
    const saved = loadSavedRun();
    if (saved) {
      btnContinue.textContent = `Tiếp tục (Vòng ${saved.loop}/${TOTAL_LOOPS})`;
      btnContinue.classList.remove("hidden");
      btnStart.textContent = "Chơi mới";
    } else {
      btnContinue.classList.add("hidden");
      btnStart.textContent = "Bắt đầu";
    }
  }

  function openPauseOverlay() {
    if (!pauseOverlay || !state.running || state.ended || state.inIntro) return;
    state.paused = true;
    clearKeys();
    isDragging = false;
    if (hplGrab.active) {
      releaseHplGrab(
        hplGrab,
        false,
        camera,
        audio,
        crosshair,
        hplHint,
        puzzles.breakerLeverPivot,
        state,
      );
    }
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (_) {}
    }
    pauseOverlay.classList.remove("hidden");
  }

  function resumeFromPause() {
    if (!pauseOverlay) return;
    pauseOverlay.classList.add("hidden");
    state.paused = false;
    audio.init();
    if (container.requestPointerLock) {
      try {
        container.requestPointerLock();
      } catch (_) {}
    }
  }

  function returnToTitleScreen() {
    timers.clearAll();
    clearIntroTimers();
    clearFinaleTimers();
    clearKeys();
    isDragging = false;
    if (hplGrab.active) {
      releaseHplGrab(
        hplGrab,
        false,
        camera,
        audio,
        crosshair,
        hplHint,
        puzzles.breakerLeverPivot,
        state,
      );
    }
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (_) {}
    }
    audio.stopEndingMelody();
    state.running = false;
    state.paused = false;
    state.inIntro = false;
    state.ended = false;
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    journalScreen.classList.add("hidden");
    keypadScreen.classList.add("hidden");
    choiceScreen.classList.add("hidden");
    endingScreen.classList.add("hidden");
    introScreen.classList.remove("active");
    document.body.classList.add("pre-start");
    refreshContinueButton();
    startScreen.classList.remove("hidden");
  }

  let wasPointerLocked = false;
  document.addEventListener("pointerlockchange", () => {
    const locked = document.pointerLockElement === container;
    if (
      wasPointerLocked &&
      !locked &&
      state.running &&
      !state.paused &&
      !state.ended &&
      !state.inIntro &&
      !shadowEvent.voicemailHold &&
      !isAnyModalOpen()
    ) {
      openPauseOverlay();
    }
    wasPointerLocked = locked;
  });

  document.addEventListener("visibilitychange", () => {
    if (
      document.hidden &&
      state.running &&
      !state.paused &&
      !state.ended &&
      !state.inIntro &&
      !isAnyModalOpen()
    ) {
      openPauseOverlay();
    }
  });

  if (btnResume) btnResume.addEventListener("click", resumeFromPause);
  if (btnPauseSettings) {
    btnPauseSettings.addEventListener("click", () => {
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
      settingsController.toggleSettings();
    });
  }
  if (btnPauseTitle) btnPauseTitle.addEventListener("click", returnToTitleScreen);

  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      const saved = loadSavedRun();
      if (!saved) {
        refreshContinueButton();
        return;
      }
      audio.init();
      audio.stopEndingMelody();
      timers.clearAll();
      clearIntroTimers();
      clearFinaleTimers();
      state.choices = saved.choices.slice();
      state.journalNotes = saved.journalNotes.slice();
      state.courageScore = saved.courageScore;
      state.denialScore = saved.denialScore;
      state.matchesLeft = saved.matchesLeft;
      state.ended = false;
      state.paused = false;
      state.inIntro = false;
      state.running = true;
      document.body.classList.remove("pre-start");
      startScreen.classList.add("hidden");
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
      ctx.renderJournal();
      ctx.setupLoopEnvironment(saved.loop);
      const story = LOOP_STORY[saved.loop] || LOOP_STORY[1];
      showSubtitle(story.wakeSpeaker, story.wakeText, 7200);
    });
  }

  refreshContinueButton();

  // UI Button Bindings
  document.getElementById("btn-start").addEventListener("click", () => {
    audio.init();
    startNewGame(true, ctx);
  });
  const btnTestEnding = document.getElementById("btn-test-ending");
  if (btnTestEnding && isDevBuild) {
    btnTestEnding.addEventListener("click", () => startQuickEndingTest(ctx));
  }
  document.getElementById("btn-restart").addEventListener("click", () => {
    audio.init();
    startNewGame(false, ctx);
  });
  if (btnRetryLoop)
    btnRetryLoop.addEventListener("click", () => retryCurrentLoop(ctx));
  introScreen.addEventListener("click", () => {
    if (state.inIntro) beginLoop1AfterIntro(ctx);
  });
  introSkipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.inIntro) beginLoop1AfterIntro(ctx);
  });
  document.getElementById("btn-journal").addEventListener("click", () =>
    toggleJournal(
      state,
      { journalScreen, settingsScreen, pauseOverlay },
      () =>
        renderJournal(state, {
          journalList,
          journalTimeline,
          journalChoices,
        }),
      clearKeys,
    ),
  );
  document.getElementById("btn-close-journal").addEventListener("click", () =>
    toggleJournal(
      state,
      { journalScreen, settingsScreen, pauseOverlay },
      () =>
        renderJournal(state, {
          journalList,
          journalTimeline,
          journalChoices,
        }),
      clearKeys,
    ),
  );
  document
    .getElementById("btn-match")
    .addEventListener("click", () =>
      toggleOrStrikeMatch(
        state,
        matchSystem.matchGroup,
        matchSystem.matchLight,
        audio,
        ctx.updateHUD,
        showSubtitle,
      ),
    );
  document
    .getElementById("btn-interact")
    .addEventListener("click", triggerInteract);

  // Choice Dialog Buttons
  if (btnChoiceA)
    btnChoiceA.addEventListener("click", () => {
      audio.init();
      resolveMoralChoice("confront", ctx);
    });
  if (btnChoiceB)
    btnChoiceB.addEventListener("click", () => {
      audio.init();
      resolveMoralChoice("avoid", ctx);
    });

  // Ending Switcher Buttons
  document.querySelectorAll(".ending-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.init();
      showEndingScreen(btn.getAttribute("data-ending"), ctx);
    });
  });

  // Foley Preview Panel
  btnFoley.addEventListener("click", () => {
    audio.init();
    const open = foleyPanel.classList.toggle("hidden") === false;
    btnFoley.classList.toggle("active", open);
    if (open && document.pointerLockElement) document.exitPointerLock();
  });
  document.getElementById("btn-close-foley").addEventListener("click", () => {
    foleyPanel.classList.add("hidden");
    btnFoley.classList.remove("active");
  });
  document.querySelectorAll(".foley-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.init();
      const sfx = btn.getAttribute("data-sfx");
      if (sfx === "door_open") audio.playDoorCreak(false);
      else if (sfx === "door_close") audio.playDoorCreak(true);
      else if (sfx === "wardrobe_open") audio.playWardrobeCreak(false);
      else if (sfx === "wardrobe_slam") audio.playWardrobeSlam();
      else if (sfx === "portrait_fall") audio.playPortraitFall();
      else if (sfx === "wood_scratch") audio.playWoodScratch(5);
      else if (sfx === "fox_cry") audio.playFoxCry(false);
      else if (sfx === "door_knock") audio.playThreeKnocks();
      else if (sfx === "scare_sting") audio.playScareChord();
      else if (sfx === "floor_creak") audio.playFloorCreak();
    });
  });

  // Audio / Voice Toggle
  const btnVoice = document.getElementById("btn-voice");
  btnVoice.addEventListener("click", () => {
    narrator.enabled = !narrator.enabled;
    if (!narrator.enabled) narrator.stop();
    btnVoice.textContent = narrator.enabled ? "Giọng kể: Bật" : "Giọng kể: Tắt";
  });

  const btnMute = document.getElementById("btn-mute");
  btnMute.addEventListener("click", () => {
    audio.init();
    audio.setMuted(!audio.muted);
    if (audio.muted) narrator.stop();
    btnMute.textContent = audio.muted ? "Âm thanh: Tắt" : "Âm thanh: Bật";
  });

  const touchPad = document.getElementById("touch-pad");
  document
    .getElementById("btn-pad-toggle")
    .addEventListener("click", () => touchPad.classList.toggle("show"));

  // Window Resize
  window.addEventListener("resize", () => {
    const w = Math.max(1, container.clientWidth || window.innerWidth || 1280);
    const h = Math.max(1, container.clientHeight || window.innerHeight || 720);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (document.hidden) return;
    if (state.running && (state.paused || state.ended)) return;

    const preset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, preset.maxDpr),
    );
    renderer.setSize(w, h, false);
    renderer.render(scene, camera);
  });

  // =========================================================
  // 7. ANIMATION & RENDER LOOP
  // =========================================================
  let lastFrameTime = performance.now();
  let lastRenderTime = lastFrameTime;
  let animFrameId = null;
  let tvFrameSkip = 0;
  let fpsFrameCount = 0;
  let fpsLastSample = lastFrameTime;
  let dripTimer = 2.4;
  let clockTickTimer = 0;
  let clockMinutesBack = 14;
  let rainFrameSkip = 0;

  const _tvPos = new THREE.Vector3(-3.85, 0.9, -6.6);

  function animate(now) {
    animFrameId = requestAnimationFrame(animate);

    // Frame Pacing
    if (settings.fpsLimit > 0) {
      const frameInterval = 1000 / settings.fpsLimit;
      const elapsed = now - lastRenderTime;
      if (elapsed < frameInterval - 0.5) return;
      lastRenderTime = now - (elapsed % frameInterval);
    } else {
      lastRenderTime = now;
    }

    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
    lastFrameTime = now;
    const tSec = now / 1000;

    // Real-time FPS Meter
    fpsFrameCount++;
    if (now - fpsLastSample >= 400) {
      const fps = Math.round((fpsFrameCount * 1000) / (now - fpsLastSample));
      fpsFrameCount = 0;
      fpsLastSample = now;
      if (settings.showFps) {
        fpsBadge.textContent = `FPS: ${fps}`;
        fpsBadge.classList.toggle("fps-low", fps < 30);
        fpsBadge.classList.toggle("fps-mid", fps >= 30 && fps < 50);
      }
    }

    const preset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;

    // Dust particles drift
    if (house.objects.dustPoints && house.objects.dustPoints.visible) {
      house.objects.dustPoints.position.y = Math.sin(tSec * 0.4) * 0.08;
      house.objects.dustPoints.rotation.y = tSec * 0.012;
    }

    // Clue & key rotation
    if (!state.loopClueFound && puzzles.clueMesh) {
      puzzles.clueMesh.rotation.y += dt * 0.8;
      puzzles.clueMesh.position.y = Math.sin(tSec * 2.2) * 0.03;
    }
    if (puzzles.studyKeyGroup && puzzles.studyKeyGroup.visible) {
      puzzles.studyKeyGroup.rotation.y += dt * 1.4;
      puzzles.studyKeyLight.intensity = 0.42 + Math.sin(tSec * 5) * 0.14;
    }

    // Breaker guide light flicker in loop 2
    if (state.loop === 2 && !state.breakerFixed) {
      puzzles.breakerLight.intensity = Math.sin(tSec * 9) > 0 ? 1.25 : 0.15;
      house.lights.kitchenGuideLight.intensity =
        Math.sin(tSec * 9) > 0 ? 1.0 : 0.2;
    }

    // Siren red/blue in loop 5
    if (state.loop === 5) {
      const flash = Math.sin(tSec * 11.5);
      house.lights.ambRedLight.intensity = flash > 0.2 ? 2.4 : 0.05;
      house.lights.ambBlueLight.intensity = flash < -0.2 ? 2.2 : 0.05;
    } else if (
      house.lights.ambRedLight.intensity > 0 ||
      house.lights.ambBlueLight.intensity > 0
    ) {
      house.lights.ambRedLight.intensity = 0;
      house.lights.ambBlueLight.intensity = 0;
    }

    // Smartphone screen glow
    if (state.loop >= 2) {
      house.lights.smLight.intensity = 0.45 + Math.sin(tSec * 4.5) * 0.25;
    }

    // Alarm Clock ticking
    clockTickTimer += dt;
    if (clockTickTimer >= 1.0) {
      clockTickTimer = 0;
      if (state.loop === 1) {
        house.objects.drawClockFace(
          Math.floor(tSec) % 4 === 0 ? "02:13" : "02:14",
        );
      } else if (state.loop === 3 || state.loop === 5) {
        clockMinutesBack = clockMinutesBack <= 0 ? 14 : clockMinutesBack - 1;
        house.objects.drawClockFace(
          `02:${String(clockMinutesBack).padStart(2, "0")}`,
        );
      } else if (state.loop === 4) {
        house.objects.drawClockFace(
          Math.floor(tSec) % 2 === 0 ? "ERR!" : "02:14",
        );
      }
    }

    // Candles flicker
    for (let i = 0; i < puzzles.candles.length; i++) {
      const c = puzzles.candles[i];
      if (c.lit) c.light.intensity = 1.45 + Math.sin(tSec * 12 + i * 3) * 0.14;
    }

    // Rain on windows (throttled canvas upload)
    const rainMod = Math.max(4, preset.tvSkip);
    rainFrameSkip = (rainFrameSkip + 1) % rainMod;
    if (rainFrameSkip === 0) {
      house.updateWindowRain(
        dt * rainMod,
        shadowEvent.mode === "loop3_chase",
      );
    }

    // TV static noise (only upload texture when near living room)
    if (state.loop >= 2) {
      house.lights.tvLight.intensity =
        1.05 + Math.sin(tSec * 29) * 0.25 + Math.cos(tSec * 43) * 0.15;
      tvFrameSkip = (tvFrameSkip + 1) % preset.tvSkip;
      if (tvFrameSkip === 0 && state.pos.distanceToSquared(_tvPos) < 85) {
        updateTVStatic();
      }
    }

    // Item glints
    for (let i = 0; i < puzzles.itemGlints.length; i++) {
      const gl = puzzles.itemGlints[i];
      if (!gl.isActiveFn()) {
        gl.sprite.visible = false;
        continue;
      }
      const d = state.pos.distanceTo(gl.basePos);
      if (d < 4.8) {
        gl.sprite.visible = true;
        const prox = 1 - d / 4.8;
        const boost = state.matchTimer > 0 ? 1.0 : 0.55;
        gl.sprite.material.opacity =
          prox * boost * (0.42 + Math.sin(tSec * 4.5 + i * 1.7) * 0.26);
        const sc = 0.17 + Math.sin(tSec * 4.5 + i) * 0.04;
        gl.sprite.scale.set(sc, sc, 1);
      } else {
        gl.sprite.visible = false;
      }
    }

    // Phone vibration & LED
    if (house.objects.phoneObj.ringing) {
      house.objects.phoneLed.intensity = Math.sin(tSec * 18) > 0 ? 1.5 : 0.1;
      house.objects.phoneGroup.rotation.z = Math.sin(tSec * 45) * 0.04;
    } else if (house.objects.phoneGroup.rotation.z !== 0) {
      house.objects.phoneGroup.rotation.z = 0;
    }

    // Smooth door swing/rattle & drawer slide (triggered via [E])
    const doorLerp = 1 - Math.exp(-5.5 * dt);
    for (let i = 0; i < doors.length; i++) {
      const d = doors[i];
      d.currentOffset += (d.targetOffset - d.currentOffset) * doorLerp;
      let rattle = 0;
      if (d.rattleTime > 0) {
        d.rattleTime = Math.max(0, d.rattleTime - dt);
        rattle = Math.sin(tSec * 65) * 0.032 * (d.rattleTime / 0.28);
      }
      d.pivot.rotation.y = d.baseRotY + d.currentOffset + rattle;
    }
    const drawerLerp = 1 - Math.exp(-8.5 * dt);
    for (let i = 0; i < puzzles.hplDrawers.length; i++) {
      const dr = puzzles.hplDrawers[i];
      const target = dr.targetDist || 0;
      if (Math.abs(dr.openDist - target) > 0.001) {
        dr.openDist += (target - dr.openDist) * drawerLerp;
        dr.group.position.copy(dr.basePos).addScaledVector(dr.slideAxis, dr.openDist);
        dr.worldPos.copy(dr.group.position).addScaledVector(dr.slideAxis, 0.2);
      }
    }

    // Wardrobe & Fridge smooth door opening lerp
    house.objects.wardrobeDoorPivot.rotation.y +=
      (house.objects.wardrobeObj.targetAngle -
        house.objects.wardrobeDoorPivot.rotation.y) *
      (1 - Math.exp(-3.5 * dt));
    house.objects.fridgeDoorPivot.rotation.y +=
      (house.objects.fridgeObj.targetAngle -
        house.objects.fridgeDoorPivot.rotation.y) *
      (1 - Math.exp(-4.0 * dt));

    // Water ripple scaling
    if (house.objects.kitchenWaterMesh.visible) {
      const ws = 0.85 + Math.sin(tSec * 28) * 0.15;
      house.objects.kitchenWaterMesh.scale.set(ws, 1, ws);
    }
    if (house.objects.bathWaterMesh.visible) {
      const ws = 0.85 + Math.cos(tSec * 26) * 0.15;
      house.objects.bathWaterMesh.scale.set(ws, 1, ws);
    }

    // Bathroom light flicker
    if (
      state.loop >= 2 &&
      (state.loop !== 2 || state.breakerFixed) &&
      house.lights.bathLight.intensity > 0.01
    ) {
      const baseBath = state.loop === 2 ? 0.62 : 0.22;
      house.lights.bathLight.intensity =
        Math.sin(tSec * 31) > -0.78 ? baseBath : baseBath * 0.18;
    }
    if (state.loop >= 2 && house.lights.fridgeLight.intensity > 0.1) {
      house.lights.fridgeLight.intensity = 0.85 + Math.sin(tSec * 24) * 0.15;
    }

    if (state.running && !state.paused && !state.ended) {
      // 1. Waking up from bed sequence
      if (state.wakingTimer > 0) {
        state.wakingTimer = Math.max(0, state.wakingTimer - dt);
        const p = 1 - state.wakingTimer / state.wakingDuration;
        const smooth = (t) => {
          const c = Math.max(0, Math.min(1, t));
          return c * c * (3 - 2 * c);
        };

        let eyeOpen = 1;
        if (p < 0.16) eyeOpen = smooth(p / 0.16) * 0.48;
        else if (p < 0.24) eyeOpen = 0.48 - smooth((p - 0.16) / 0.08) * 0.36;
        else if (p < 0.34) eyeOpen = 0.12 + smooth((p - 0.24) / 0.1) * 0.56;
        else if (p < 0.4) eyeOpen = 0.68 - smooth((p - 0.34) / 0.06) * 0.28;
        else if (p < 0.52) eyeOpen = 0.4 + smooth((p - 0.4) / 0.12) * 0.6;
        else eyeOpen = 1;

        const lidPct = (1 - eyeOpen) * 100;
        eyelidTop.style.transform = `translateY(-${100 - lidPct}%)`;
        eyelidBottom.style.transform = `translateY(${100 - lidPct}%)`;
        eyeHaze.style.opacity = ((1 - eyeOpen) * 0.72).toFixed(2);

        let cx, cy, cz, ry, rx, rz;
        if (p < 0.42) {
          const t1 = smooth(p / 0.42);
          cx = -1.62;
          cy = 0.8 + t1 * 0.04;
          cz = 3.65;
          ry = -0.72 + t1 * 0.18;
          rx = 0.38 - t1 * 0.14;
          rz = 0.24 - t1 * 0.06;
        } else if (p < 0.72) {
          const t2 = smooth((p - 0.42) / 0.3);
          cx = -1.62 + (-1.05 - -1.62) * t2;
          cy = 0.84 + (1.34 - 0.84) * t2;
          cz = 3.65 + (3.05 - 3.65) * t2;
          ry = -0.54 + (-0.08 - -0.54) * t2;
          rx = 0.24 + (-0.04 - 0.24) * t2;
          rz = 0.18 * (1 - t2);
        } else {
          const t3 = smooth((p - 0.72) / 0.28);
          if (!state.wakeStepPlayed && t3 > 0.38) {
            state.wakeStepPlayed = true;
            audio.playFootstep(0.24, false);
          }
          const stepDip = Math.sin(t3 * Math.PI) * -0.09;
          cx = -1.05 + (state.pos.x - -1.05) * t3;
          cy = 1.34 + (state.pos.y - 1.34) * t3 + stepDip;
          cz = 3.05 + (state.pos.z - 3.05) * t3;
          ry = -0.08 + (state.yaw - -0.08) * t3;
          rx = -0.04 + (state.pitch - -0.04) * t3;
          rz = Math.sin(t3 * Math.PI) * -0.035;
        }

        camera.position.set(cx, cy, cz);
        camera.rotation.order = "YXZ";
        camera.rotation.y = ry;
        camera.rotation.x = rx;
        camera.rotation.z = rz;

        if (state.wakingTimer === 0) {
          eyelidTop.style.transform = "translateY(-100%)";
          eyelidBottom.style.transform = "translateY(100%)";
          eyeHaze.style.opacity = "0";
        }
        renderer.render(scene, camera);
        return;
      }

      // 2. Player movement
      const { isMoving, sprinting } = updatePlayerMovement(
        dt,
        tSec,
        state,
        camera,
        colliders,
        audio,
        settings,
        shadowEvent,
      );

      // 3. Held document inspection animation
      updateHeldPaper(dt, tSec, state, heldPaperSystem.heldPaperGroup);

      // 4. Match burning
      updateMatch(
        dt,
        tSec,
        state,
        matchSystem.matchGroup,
        matchSystem.matchLight,
        matchSystem.flameMesh,
        matchSystem.flameSprite,
        matchSystem.glowHalo,
        isMoving,
        sprinting,
      );

      // 5. Water faucet drip audio
      dripTimer -= dt;
      if (dripTimer <= 0) {
        dripTimer = 2.2 + Math.random() * 1.8;
        if (
          (house.objects.kitchenFaucetObj.dripping &&
            state.pos.distanceTo(house.objects.kitchenFaucetObj.worldPos) <
              6.5) ||
          (house.objects.bathFaucetObj.dripping &&
            state.pos.distanceTo(house.objects.bathFaucetObj.worldPos) < 6.0)
        ) {
          audio.playWaterDrip();
        }
      }

      // 6. Horror events & tension
      _playerRight.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      const shadowTension = updateShadowEvents(dt, tSec, isMoving, ctx);

      // 7. Fear level & Lighting
      updateFearAndLighting(dt, tSec, ctx);

      // 8. Dynamic audio drone update
      const tvDist = state.pos.distanceTo(_tvPos);
      const tvProx = state.loop >= 2 ? Math.max(0, 1 - tvDist / 7.5) : 0;
      if (!shadowEvent.melodyStarted && !shadowEvent.shadowStopped) {
        audio.update(
          Math.max(state.fear / 100, shadowTension),
          tvProx,
          house.objects.phoneObj.ringing,
          tSec,
        );
      }
      state.wasMoving = isMoving;

      // 9. Camera positioning, head bob & trauma shake
      let shakeX = 0;
      let shakeY = 0;
      if (state.shakeTime > 0) {
        state.shakeTime = Math.max(0, state.shakeTime - dt);
        const shakeAmp = state.panicTimer > 0 ? 0.12 : 0.08;
        shakeX = (Math.random() - 0.5) * shakeAmp;
        shakeY = (Math.random() - 0.5) * shakeAmp;
      }

      const bob = Math.sin(state.bobPhase) * 0.032 * state.bobBlend;
      const panicRoll = state.panicTimer > 0 ? Math.sin(tSec * 9.5) * 0.055 : 0;
      const sway =
        Math.max(state.fear / 100, shadowTension) *
          Math.sin(tSec * 2.6) *
          0.032 +
        panicRoll;
      camera.position.set(
        state.pos.x + shakeX,
        state.pos.y + bob + shakeY,
        state.pos.z,
      );
      camera.rotation.order = "YXZ";
      camera.rotation.y = state.yaw;
      camera.rotation.x = state.pitch;
      camera.rotation.z = sway;

      // 10. Interactable targeting & crosshair update
      if (state.holdingPaper) {
        clearInteractUI(hudCache, { crosshair, interactPrompt });
        crosshair.style.opacity = "0";
      } else {
        currentTarget = findInteractable();
        const promptLabel = currentTarget ? currentTarget.label() : "";
        const shouldShow = Boolean(promptLabel);
        const canGrab = Boolean(
          currentTarget && isHplGrabbable(currentTarget, state),
        );
        crosshair.classList.toggle("grab", canGrab && !hplGrab.active);

        if (hplHint) {
          if (hplGrab.active && hplGrab.target) {
            const ht = hplGrab.target;
            let htxt = "";
            if (ht.type === "door")
              htxt = `Đang kéo cửa: ${Math.round((Math.abs(ht.currentOffset) / (Math.PI * 0.62)) * 100)}%`;
            else if (ht.type === "hpl_drawer")
              htxt = `Đang kéo ngăn kéo: ${Math.round((ht.openDist / ht.maxSlide) * 100)}%`;
            else if (ht.type === "breaker")
              htxt = `Đang gạt cầu dao lên: ${Math.round(((hplGrab.leverAngle + 0.55) / 0.75) * 100)}%`;
            else if (ht.type === "hpl_prop")
              htxt = `Đang cầm ${ht.name} · [Chuột phải] / [G] Ném đánh lạc hướng`;
            hplHint.textContent = htxt;
            hplHint.classList.toggle("visible", Boolean(htxt));
          } else {
            hplHint.classList.remove("visible");
          }
        }

        if (shouldShow !== hudCache.interactActive) {
          hudCache.interactActive = shouldShow;
          crosshair.classList.toggle("active", shouldShow && !canGrab);
          interactPrompt.classList.toggle("visible", shouldShow);
        }
        if (shouldShow && hudCache.interactText !== promptLabel) {
          hudCache.interactText = promptLabel;
          interactPrompt.textContent = promptLabel;
        }
      }

      ctx.updateHUD();
    } else if (!state.running) {
      camera.position.set(-1.3, 1.15, 3.2);
      camera.lookAt(0.4, 1.15, -1.0);
    }

    renderer.render(scene, camera);
  }

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animate(performance.now());
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initGame();
} else {
  window.addEventListener("DOMContentLoaded", initGame);
}
```

---

### <a id="src-player-controls-js"></a> Tập tin: `src/player/controls.js` (97 dòng)

```javascript
import * as THREE from 'three';

export const keys = {};

export function clearKeys() {
  for (const k in keys) keys[k] = false;
}

export function collides(x, z, colliders, r = 0.3) {
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    if (c.active !== false && x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ) {
      return true;
    }
  }
  return false;
}

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();

export function updatePlayerMovement(dt, tSec, state, camera, colliders, audio, settings, shadowEvent) {
  // Smooth camera pitch/yaw interpolation
  if (settings.camSmooth) {
    const camLerp = 1 - Math.exp(-22 * dt);
    state.yaw += (state.targetYaw - state.yaw) * camLerp;
    state.pitch += (state.targetPitch - state.pitch) * camLerp;
  } else {
    state.yaw = state.targetYaw;
    state.pitch = state.targetPitch;
  }

  _forward.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
  _right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
  _move.set(0, 0, 0);
  if (keys['KeyW'] || keys['ArrowUp']) _move.add(_forward);
  if (keys['KeyS'] || keys['ArrowDown']) _move.sub(_forward);
  if (keys['KeyD'] || keys['ArrowRight']) _move.add(_right);
  if (keys['KeyA'] || keys['ArrowLeft']) _move.sub(_right);

  const canMove = !state.holdingPaper && !shadowEvent.voicemailHold && !shadowEvent.whiteoutDone;
  const hasInput = canMove && _move.lengthSq() > 0;
  const sprinting = !!(keys['ShiftLeft'] || keys['ShiftRight']);
  let maxSpeed = sprinting ? 4.05 : 2.38;
  if (state.panicTimer > 0) {
    maxSpeed *= 0.54;
  }
  if (shadowEvent.mode === 'loop3_chase' && state.pos.z < -15.0) {
    const calmEase = Math.max(0, Math.min(1, (-15.0 - state.pos.z) / 36.0));
    maxSpeed = Math.min(maxSpeed, 3.0) * (1 - calmEase * 0.46);
  }

  let targetVelX = 0, targetVelZ = 0;
  if (hasInput) {
    _move.normalize();
    targetVelX = _move.x * maxSpeed;
    targetVelZ = _move.z * maxSpeed;
  }

  const accelRate = hasInput ? 13.0 : 11.0;
  const velLerp = 1 - Math.exp(-accelRate * dt);
  state.velX += (targetVelX - state.velX) * velLerp;
  state.velZ += (targetVelZ - state.velZ) * velLerp;

  const curSpeed = Math.hypot(state.velX, state.velZ);
  const isMoving = canMove && curSpeed > 0.12;

  if (canMove && curSpeed > 0.01) {
    const stepX = state.velX * dt;
    const stepZ = state.velZ * dt;
    if (!collides(state.pos.x + stepX, state.pos.z, colliders)) state.pos.x += stepX;
    else state.velX = 0;
    if (!collides(state.pos.x, state.pos.z + stepZ, colliders)) state.pos.z += stepZ;
    else state.velZ = 0;
  } else if (!canMove) {
    state.velX = 0;
    state.velZ = 0;
  }

  if (isMoving) {
    state.stepAccum += curSpeed * dt;
    if (state.stepAccum > 1.15) {
      state.stepAccum = 0;
      audio.playFootstep(sprinting ? 0.38 : 0.26, false);
    }
  }

  const bobBlendTarget = isMoving ? Math.min(1, curSpeed / 2.3) : 0;
  state.bobBlend += (bobBlendTarget - state.bobBlend) * (1 - Math.exp(-10 * dt));
  if (state.bobBlend > 0.01) {
    state.bobPhase += dt * (sprinting ? 11.2 : 7.2);
  }

  return { isMoving, sprinting, curSpeed, forward: _forward, right: _right };
}
```

---

### <a id="src-player-heldPaper-js"></a> Tập tin: `src/player/heldPaper.js` (34 dòng)

```javascript
import * as THREE from 'three';

export function createHeldPaperSystem(camera, heldPaperMat) {
  const heldPaperGroup = new THREE.Group();
  const heldPaperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.40), heldPaperMat);
  heldPaperMesh.renderOrder = 999;
  heldPaperGroup.add(heldPaperMesh);

  heldPaperGroup.position.set(0, -0.55, -0.44);
  heldPaperGroup.rotation.x = -0.06;
  heldPaperGroup.visible = false;
  camera.add(heldPaperGroup);

  return { heldPaperGroup, heldPaperMesh };
}

export function updateHeldPaper(dt, tSec, state, heldPaperGroup) {
  if (state.holdingPaper) {
    state.paperAnim = Math.min(1, state.paperAnim + dt * 4.5);
  } else if (state.paperAnim > 0) {
    state.paperAnim = Math.max(0, state.paperAnim - dt * 5.0);
    if (state.paperAnim === 0) heldPaperGroup.visible = false;
  }
  if (heldPaperGroup.visible) {
    const pe = state.paperAnim * state.paperAnim * (3 - 2 * state.paperAnim);
    heldPaperGroup.position.set(
      Math.sin(tSec * 1.4) * 0.004,
      -0.55 + pe * 0.52 + Math.cos(tSec * 1.9) * 0.003,
      -0.44
    );
    heldPaperGroup.rotation.z = Math.sin(tSec * 1.1) * 0.012;
  }
}
```

---

### <a id="src-player-hplPhysics-js"></a> Tập tin: `src/player/hplPhysics.js` (215 dòng)

```javascript
import * as THREE from 'three';
import { TOTAL_LOOPS, LOOP_STORY } from '../config/storyData.js';

const _camDir = new THREE.Vector3();

export function createHplPhysicsState() {
  return {
    active: false,
    target: null,
    creakCooldown: 0,
    holdPos: new THREE.Vector3(),
    leverAngle: -0.55
  };
}

export function isHplGrabbable(item, state) {
  if (!item) return false;
  if (item.type === 'door') return true;
  if (item.type === 'hpl_drawer' || item.type === 'hpl_prop') return true;
  if (item.type === 'breaker' && state.loop === 2 && !state.breakerFixed) return true;
  return false;
}

export function startHplGrab(item, hplGrab, state, audio, showSubtitle, crosshair) {
  if (!isHplGrabbable(item, state)) return false;
  if (item.type === 'door') {
    if (item.isFrontDoor && !state.loopClueFound) {
      item.rattleTime = 0.28;
      audio.playDoorSlam();
      showSubtitle('Cửa chính chốt chặt', LOOP_STORY[state.loop].doorLockedText, 4400);
      return false;
    }
    if (item.id === 'door_study' && state.loop === 1 && !state.studyKeyFound) {
      item.rattleTime = 0.28;
      audio.playDoorSlam();
      showSubtitle('Cửa phòng làm việc đang khóa', 'Tay nắm cửa kẹt cứng... Cần tìm chiếc chìa khóa đồng trước.', 4400);
      return false;
    }
  }
  hplGrab.active = true;
  hplGrab.target = item;
  hplGrab.creakCooldown = 0;
  if (item.type === 'breaker') {
    hplGrab.leverAngle = item.leverPivot ? item.leverPivot.rotation.x : -0.55;
  } else if (item.type === 'hpl_prop') {
    item.isDynamic = false;
    item.vel.set(0, 0, 0);
    audio.playFloorCreak();
  }
  if (crosshair) crosshair.classList.add('holding');
  return true;
}

export function releaseHplGrab(hplGrab, throwProp, camera, audio, crosshair, hplHint, breakerLeverPivot, state) {
  if (!hplGrab.active) return;
  const item = hplGrab.target;
  hplGrab.active = false;
  hplGrab.target = null;
  if (crosshair) crosshair.classList.remove('holding');
  if (hplHint) hplHint.classList.remove('visible');
  if (!item) return;

  if (item.type === 'hpl_prop') {
    item.isDynamic = true;
    camera.getWorldDirection(_camDir);
    if (throwProp) {
      item.vel.copy(_camDir).multiplyScalar(8.4);
      item.vel.y += 1.65;
      item.angVel.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
      audio.playMatchStrike();
    } else {
      item.vel.copy(_camDir).multiplyScalar(0.8);
      item.angVel.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    }
  } else if (item.type === 'door') {
    item.targetOffset = item.currentOffset;
    item.isOpen = Math.abs(item.currentOffset) > 0.52;
    item.collider.active = !item.isOpen;
  } else if (item.type === 'breaker' && breakerLeverPivot && !state.breakerFixed) {
    breakerLeverPivot.rotation.x = -0.55;
  }
}

export function applyHplMouseDrag(dx, dy, hplGrab, settings, state, audio, breakerLeverPivot, onBreakerComplete, onMoralChoiceTrigger, showSubtitle) {
  const item = hplGrab.target;
  if (!item) return;
  if (item.type === 'door') {
    const pull = (dx * 0.0042 - dy * 0.0032) * settings.sensitivity;
    const prev = item.currentOffset;
    item.currentOffset = Math.max(-Math.PI * 0.62, Math.min(0, item.currentOffset - pull));
    item.targetOffset = item.currentOffset;
    item.angVel = (item.currentOffset - prev) * 18;
    item.isOpen = Math.abs(item.currentOffset) > 0.52;
    item.collider.active = !item.isOpen;
    if (Math.abs(pull) > 0.012 && hplGrab.creakCooldown <= 0) {
      audio.playDoorCreak(pull < 0);
      hplGrab.creakCooldown = 0.55;
    }
    if (prev < -0.15 && item.currentOffset >= -0.01 && Math.abs(item.angVel) > 0.6) {
      audio.playDoorSlam();
    }
    if (item.isFrontDoor && state.loopClueFound && state.loop < TOTAL_LOOPS && Math.abs(item.currentOffset) > 0.36) {
      if (onMoralChoiceTrigger) onMoralChoiceTrigger(state.loop);
    }
  } else if (item.type === 'hpl_drawer') {
    const slide = (dy * 0.0022 - dx * 0.0008) * settings.sensitivity;
    const prev = item.openDist;
    item.openDist = Math.max(0, Math.min(item.maxSlide, item.openDist + slide));
    item.vel = (item.openDist - prev) * 12;
    if (Math.abs(slide) > 0.01 && hplGrab.creakCooldown <= 0) {
      audio.playFloorCreak();
      hplGrab.creakCooldown = 0.45;
    }
    if (item.openDist > item.maxSlide * 0.72 && item.inspectedInLoop !== state.loop) {
      item.inspectedInLoop = state.loop;
      showSubtitle(item.name.charAt(0).toUpperCase() + item.name.slice(1), item.noteText, 4600, false, true);
    }
  } else if (item.type === 'breaker' && state.loop === 2 && !state.breakerFixed && breakerLeverPivot) {
    hplGrab.leverAngle = Math.max(-0.55, Math.min(0.35, hplGrab.leverAngle - dy * 0.0055 * settings.sensitivity));
    breakerLeverPivot.rotation.x = hplGrab.leverAngle;
    if (hplGrab.leverAngle >= 0.2) {
      if (onBreakerComplete) onBreakerComplete();
    }
  }
}

export function updateHplPhysics(dt, tSec, state, camera, colliders, hplGrab, hplDrawers, hplProps, doors, shadow, shadowEvent, audio, showSubtitle, collidesFn) {
  if (hplGrab.creakCooldown > 0) hplGrab.creakCooldown = Math.max(0, hplGrab.creakCooldown - dt);
  const doorLerp = 1 - Math.exp(-6.5 * dt);

  // Doors
  for (let i = 0; i < doors.length; i++) {
    const d = doors[i];
    if (hplGrab.active && hplGrab.target === d) {
      d.pivot.rotation.y = d.baseRotY + d.currentOffset;
    } else {
      if (Math.abs(d.angVel) > 0.005) {
        d.currentOffset = Math.max(-Math.PI * 0.62, Math.min(0, d.currentOffset + d.angVel * dt));
        d.targetOffset = d.currentOffset;
        d.angVel *= Math.exp(-6.2 * dt);
        d.isOpen = Math.abs(d.currentOffset) > 0.52;
        d.collider.active = !d.isOpen;
      } else {
        d.currentOffset += (d.targetOffset - d.currentOffset) * doorLerp;
      }
      let rattle = 0;
      if (d.rattleTime > 0) {
        d.rattleTime = Math.max(0, d.rattleTime - dt);
        rattle = Math.sin(tSec * 65) * 0.032 * (d.rattleTime / 0.28);
      }
      d.pivot.rotation.y = d.baseRotY + d.currentOffset + rattle;
    }
  }

  // Drawers
  for (let i = 0; i < hplDrawers.length; i++) {
    const dr = hplDrawers[i];
    if (!(hplGrab.active && hplGrab.target === dr) && Math.abs(dr.vel) > 0.002) {
      dr.openDist = Math.max(0, Math.min(dr.maxSlide, dr.openDist + dr.vel * dt));
      dr.vel *= Math.exp(-8.5 * dt);
    }
    dr.group.position.copy(dr.basePos).addScaledVector(dr.slideAxis, dr.openDist);
    dr.worldPos.copy(dr.group.position).addScaledVector(dr.slideAxis, 0.2);
  }

  // Props
  for (let i = 0; i < hplProps.length; i++) {
    const p = hplProps[i];
    if (hplGrab.active && hplGrab.target === p) {
      camera.getWorldDirection(_camDir);
      hplGrab.holdPos.copy(camera.position).addScaledVector(_camDir, 0.92);
      hplGrab.holdPos.y -= 0.14;
      p.group.position.lerp(hplGrab.holdPos, 1 - Math.exp(-16 * dt));
      p.group.rotation.y += dt * 0.6;
      p.worldPos.copy(p.group.position);
    } else if (p.isDynamic) {
      p.vel.y -= 14.5 * dt;
      const nx = p.group.position.x + p.vel.x * dt;
      const nz = p.group.position.z + p.vel.z * dt;
      if (collidesFn(nx, p.group.position.z, colliders)) { p.vel.x *= -0.45; }
      else { p.group.position.x = nx; }
      if (collidesFn(p.group.position.x, nz, colliders)) { p.vel.z *= -0.45; }
      else { p.group.position.z = nz; }
      p.group.position.y += p.vel.y * dt;
      p.group.rotation.x += p.angVel.x * dt;
      p.group.rotation.y += p.angVel.y * dt;
      p.group.rotation.z += p.angVel.z * dt;

      if (p.group.position.y <= p.radius) {
        p.group.position.y = p.radius;
        const impactSpeed = Math.abs(p.vel.y) + Math.hypot(p.vel.x, p.vel.z) * 0.35;
        if (impactSpeed > 2.4) {
          if (p.kind === 'bottle' || p.kind === 'mug') audio.playPortraitFall();
          else audio.playDoorSlam();
          if (shadow.group.visible && (shadowEvent.mode === 'loop3_chase' || shadowEvent.mode === 'peripheral_peek' || shadowEvent.mode === 'loop3_front')) {
            shadowEvent.distractPos.copy(p.group.position);
            shadowEvent.distractTimer = 3.8;
            showSubtitle('Tiếng động đánh lạc hướng!', 'Bóng Đen vừa quay về phía đồ vật rơi — tận dụng lúc này di chuyển!', 3200, false, true);
          }
        }
        p.vel.y *= -0.34;
        p.vel.x *= 0.68;
        p.vel.z *= 0.68;
        p.angVel.multiplyScalar(0.55);
        if (Math.abs(p.vel.y) < 0.25 && Math.hypot(p.vel.x, p.vel.z) < 0.18) {
          p.vel.set(0, 0, 0);
          p.angVel.set(0, 0, 0);
          p.isDynamic = false;
        }
      }
      p.worldPos.copy(p.group.position);
    }
  }
}
```

---

### <a id="src-player-match-js"></a> Tập tin: `src/player/match.js` (129 dòng)

```javascript
import * as THREE from "three";
import { makeFlameSpriteTex, makeGlowHaloTex } from "../world/textures.js";

export function createMatchSystem(scene, camera) {
  // Brighter, wider warm flame with softer falloff (decay 1.25) and NO expensive 6-pass PointLight shadow cubemap
  const matchLight = new THREE.PointLight(0xff9942, 0, 10.5, 1.45);
  matchLight.position.set(0.18, -0.06, -0.34);
  matchLight.castShadow = false;
  camera.add(matchLight);

  const matchGroup = new THREE.Group();
  const stickPivot = new THREE.Group();
  stickPivot.rotation.set(0.22, 0, 0.14);
  const stickMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.0075, 0.145, 0.0075),
    new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.85 }),
  );
  stickPivot.add(stickMesh);
  const charTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0042, 0.022, 8),
    new THREE.MeshStandardMaterial({
      color: 0x1a110e,
      emissive: 0x99300c,
      emissiveIntensity: 0.9,
      roughness: 0.95,
    }),
  );
  charTip.position.set(0, 0.078, 0);
  stickPivot.add(charTip);
  matchGroup.add(stickPivot);

  const flameMesh = new THREE.Group();
  const flameSpriteMat = new THREE.SpriteMaterial({
    map: makeFlameSpriteTex(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flameSprite = new THREE.Sprite(flameSpriteMat);
  flameSprite.scale.set(0.052, 0.095, 1);
  flameSprite.position.set(0, 0.034, 0);
  flameMesh.add(flameSprite);

  const glowHaloMat = new THREE.SpriteMaterial({
    map: makeGlowHaloTex(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowHalo = new THREE.Sprite(glowHaloMat);
  glowHalo.scale.set(0.15, 0.15, 1);
  glowHaloMat.opacity = 0.65;
  glowHalo.position.set(0, 0.030, 0);
  flameMesh.add(glowHalo);

  flameMesh.position.set(-0.012, 0.084, 0.019);
  matchGroup.add(flameMesh);
  matchGroup.position.set(0.26, -0.25, -0.45);
  matchGroup.visible = false;
  camera.add(matchGroup);

  return { matchGroup, matchLight, flameMesh, flameSprite, glowHalo };
}

export function toggleOrStrikeMatch(
  state,
  matchGroup,
  matchLight,
  audio,
  updateHUD,
  showSubtitle,
) {
  if (!state.running || state.paused || state.ended || state.wakingTimer > 0)
    return;
  if (state.matchTimer > 0) {
    state.matchTimer = 0;
    matchGroup.visible = false;
    matchLight.intensity = 0;
    audio.playMatchBlowOut();
    updateHUD();
    return;
  }
  if (state.matchesLeft <= 0) {
    showSubtitle(
      "Hết diêm",
      "Bạn đã dùng hết que diêm rồi... Hãy dựa vào ánh sáng nến và đèn trong nhà.",
      3500,
    );
    return;
  }
  state.matchesLeft--;
  state.matchTimer = state.matchMax;
  matchGroup.visible = true;
  matchLight.intensity = 1.95;
  audio.playMatchStrike();
  updateHUD();
}

export function updateMatch(
  dt,
  tSec,
  state,
  matchGroup,
  matchLight,
  flameMesh,
  flameSprite,
  glowHalo,
  isMoving,
  sprinting,
) {
  if (state.matchTimer > 0 && !state.holdingPaper) {
    state.matchTimer = Math.max(
      0,
      state.matchTimer - dt * (sprinting ? 1.4 : 1.0),
    );
    const fade = Math.min(1, state.matchTimer / 3.2);
    matchLight.intensity = (1.95 + Math.sin(tSec * 19) * 0.18) * fade;
    const flk = 1 + Math.sin(tSec * 23) * 0.09 + Math.cos(tSec * 37) * 0.06;
    const stretch = 1 + Math.sin(tSec * 17) * 0.13;
    flameMesh.scale.set(flk * fade, stretch * fade, flk * fade);
    flameSprite.material.rotation =
      Math.sin(tSec * 14) * 0.09 + (isMoving ? -0.14 : 0);
    glowHalo.scale.set(0.15 * flk, 0.15 * flk, 1);
    if (state.matchTimer === 0) {
      matchGroup.visible = false;
      matchLight.intensity = 0;
    }
  }
}
```

---

### <a id="src-style-css"></a> Tập tin: `src/style.css` (1,505 dòng)

```css
:root {
  --bg: #030406;
  --panel: rgba(9, 10, 14, 0.78);
  --border: rgba(232, 168, 96, 0.28);
  --ink: #f0ece3;
  --mute: #a39e93;
  --amber: #e89b4c;
  --amber-bright: #f7c37c;
  --teal: #7eb0ad;
  --red: #d44d42;
  --green: #69c78a;
}

* { box-sizing: border-box; user-select: none; -webkit-user-select: none; }

html, body {
  margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
  background: var(--bg); color: var(--ink);
  font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
}

#canvas-container { position: fixed; inset: 0; width: 100%; height: 100%; cursor: crosshair; }

#film-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 4; opacity: 0.048;
  background-image: radial-gradient(rgba(255,255,255,0.6) 1px, transparent 0);
  background-size: 3px 3px;
}

/* Chế độ đồ họa Thấp: tắt blur nặng và film grain để tối đa FPS */
body.gfx-low #film-grain { display: none; }
body.gfx-low .hud-pill,
body.gfx-low .hud-btn,
body.gfx-low .foley-panel,
body.gfx-low .overlay-screen {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#fear-vignette {
  position: fixed; inset: 0; pointer-events: none;
  background: radial-gradient(circle at center, transparent 34%, rgba(2, 2, 4, 0.95) 100%);
  opacity: 0.62; transition: opacity 0.25s ease; z-index: 5;
}

#danger-pulse {
  position: fixed; inset: 0; pointer-events: none;
  background: radial-gradient(circle at center, transparent 38%, rgba(150, 16, 14, 0.62) 100%);
  opacity: 0; transition: opacity 0.16s ease; z-index: 6;
}


#panic-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 7;
  background: radial-gradient(circle at center, transparent 18%, rgba(120, 10, 12, 0.72) 68%, rgba(4, 2, 4, 0.96) 100%);
  opacity: 0; transition: opacity 0.22s ease;
}
#panic-overlay.active {
  opacity: 1;
  animation: panicThrob 0.42s infinite alternate;
}
@keyframes panicThrob {
  from { transform: scale(1); filter: contrast(1.05); }
  to { transform: scale(1.035); filter: contrast(1.25); }
}
body.in-panic #canvas-container {
  filter: saturate(0.55) contrast(1.18);
}

#blink-overlay {
  position: fixed; inset: 0; pointer-events: none; background: #020203;
  opacity: 0; transition: opacity 0.85s ease; z-index: 8;
  display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;
}

#blink-clock {
  font-family: monospace; font-size: 44px; letter-spacing: 0.16em; color: var(--red);
  opacity: 0; transition: opacity 0.4s ease;
}

#blink-sub {
  font-family: 'Lora', 'Times New Roman', serif; font-style: italic;
  font-size: 16px; color: var(--mute); opacity: 0; transition: opacity 0.4s ease;
}

#crosshair {
  position: fixed; top: 50%; left: 50%; width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px;
  border-radius: 50%; background: rgba(240, 236, 227, 0.48); pointer-events: none; z-index: 10;
  transition: transform 0.15s ease, background 0.15s ease;
}

#crosshair.active {
  transform: scale(2.0); background: var(--amber-bright);
  box-shadow: 0 0 12px rgba(232, 155, 76, 0.95);
}

#interact-prompt {
  position: fixed; top: calc(50% + 22px); left: 50%; transform: translateX(-50%);
  padding: 6px 14px; background: rgba(8, 9, 12, 0.88); border: 1px solid var(--border);
  border-radius: 999px; font-size: 13px; color: var(--amber-bright);
  pointer-events: none; opacity: 0; transition: opacity 0.18s ease; z-index: 12; white-space: nowrap;
}

#interact-prompt.visible { opacity: 1; }

#chase-banner {
  position: fixed; top: 74px; left: 50%; transform: translateX(-50%);
  text-align: center; pointer-events: none; z-index: 22;
  opacity: 0; transition: opacity 0.35s ease;
}
#chase-banner.visible { opacity: 1; animation: chasePulse 0.9s infinite alternate; }
#chase-banner .chase-main {
  font-family: 'Lora', 'Times New Roman', serif; font-weight: 700;
  font-size: clamp(28px, 5vw, 48px); letter-spacing: 0.14em;
  color: #ff3b30; text-shadow: 0 0 24px rgba(255, 42, 32, 0.85), 0 2px 10px #000;
}
#chase-banner .chase-sub {
  font-family: monospace; font-size: 13px; letter-spacing: 0.24em;
  color: #f5e6d8; text-transform: uppercase; margin-top: 4px;
  text-shadow: 0 1px 8px #000;
}
@keyframes chasePulse {
  from { transform: translateX(-50%) scale(1); }
  to { transform: translateX(-50%) scale(1.04); }
}

#hud-top {
  position: fixed; top: 14px; left: 16px; right: 16px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
  pointer-events: none; z-index: 15;
}

.hud-group { display: flex; flex-wrap: wrap; gap: 8px; pointer-events: auto; }

.hud-pill {
  display: flex; align-items: center; gap: 8px; padding: 6px 11px;
  background: var(--panel); border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 9px; background: rgba(10, 12, 16, 0.84); font-size: 12.5px; color: var(--ink);
}

.anomaly-pill {
  border-color: rgba(232, 155, 76, 0.42); color: var(--amber-bright); font-weight: 600;
}
.anomaly-pill.done {
  border-color: rgba(105, 199, 138, 0.5); color: var(--green);
}

.clock-pill {
  font-family: monospace; color: #f07b72; border-color: rgba(212, 77, 66, 0.35); font-weight: 600;
}

/* Bộ đếm FPS trực tiếp trên HUD */
.fps-pill {
  font-family: monospace; font-weight: 700; font-size: 12px;
  min-width: 72px; justify-content: center;
  border-color: rgba(105, 199, 138, 0.35); color: var(--green);
}
.fps-pill.hidden { display: none; }
.fps-pill.fps-mid { color: var(--amber-bright); border-color: rgba(232, 155, 76, 0.45); }
.fps-pill.fps-low { color: #ff6b63; border-color: rgba(212, 77, 66, 0.5); }

.bar-track { width: 64px; height: 5px; background: rgba(255, 255, 255, 0.12); border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; width: 0%; border-radius: 999px; transition: width 0.2s linear, background 0.3s ease; }
#fear-bar { background: var(--teal); }
#match-bar { background: var(--amber); }

.hud-btn {
  padding: 6px 11px; background: var(--panel); border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9px; color: var(--ink); font-size: 12.5px; cursor: pointer; background: rgba(10, 12, 16, 0.84);
}
.hud-btn:hover { border-color: var(--amber); }
.hud-btn.active { border-color: var(--amber); color: var(--amber-bright); }
.hud-select {
  padding: 6px 8px; background: var(--panel); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 9px; color: var(--ink); font-size: 12px; max-width: 140px; cursor: pointer;
}

.foley-panel {
  position: fixed; top: 60px; right: 16px; width: min(330px, calc(100% - 32px));
  padding: 12px 14px; background: rgba(11, 12, 17, 0.94);
  border: 1px solid rgba(232, 155, 76, 0.36); border-radius: 12px;
  background: rgba(8, 10, 14, 0.88); z-index: 42;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.75);
}
.foley-panel.hidden { display: none; }
.foley-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px; font-size: 12px; font-weight: 600; color: var(--amber-bright);
  letter-spacing: 0.04em;
}
.foley-close {
  background: transparent; border: none; color: var(--mute); cursor: pointer;
  font-size: 14px; padding: 2px 6px; border-radius: 6px;
}
.foley-close:hover { color: var(--ink); background: rgba(255,255,255,0.08); }
.foley-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px;
}
.foley-btn {
  padding: 8px 10px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
  color: var(--ink); font-size: 12px; cursor: pointer; text-align: left;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}
.foley-btn:hover { border-color: var(--amber); background: rgba(232, 155, 76, 0.14); }
.foley-btn:active { transform: scale(0.97); }

#subtitle-box {
  position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%);
  width: min(650px, calc(100% - 32px)); padding: 13px 20px;
  background: rgba(6, 7, 10, 0.9); border-left: 2px solid var(--amber); border-radius: 6px;
  text-align: center; pointer-events: none; opacity: 0; transition: opacity 0.36s ease; z-index: 16;
}
#subtitle-box.visible { opacity: 1; }

#subtitle-speaker {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--amber-bright); margin-bottom: 4px;
}

#subtitle-text {
  font-family: 'Lora', 'Times New Roman', serif; font-style: italic;
  font-size: 16px; line-height: 1.55; color: var(--ink);
}

#hud-bottom {
  position: fixed; bottom: 16px; left: 16px; right: 16px;
  display: flex; justify-content: space-between; align-items: flex-end; gap: 12px;
  pointer-events: none; z-index: 15;
}

.controls-hint {
  padding: 6px 12px; background: rgba(8, 9, 12, 0.72); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px; font-size: 12px; color: var(--mute); pointer-events: auto;
}

.controls-hint kbd {
  display: inline-block; padding: 1px 5px; margin: 0 2px; border-radius: 4px;
  background: rgba(255, 255, 255, 0.1); color: var(--ink); font-family: monospace; font-size: 11px;
}

.action-buttons { display: flex; gap: 8px; pointer-events: auto; }
.action-btn {
  padding: 8px 13px; background: var(--panel); border: 1px solid var(--border);
  border-radius: 9px; color: var(--amber-bright); font-size: 12.5px; font-weight: 600; cursor: pointer;
}
.action-btn:hover { background: rgba(232, 155, 76, 0.18); }

#touch-pad {
  display: none; grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(2, 44px);
  gap: 6px; pointer-events: auto;
}
#touch-pad.show { display: grid; }

.pad-btn {
  background: var(--panel); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 8px;
  color: var(--ink); font-size: 16px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; touch-action: none;
}

body.pre-start #hud-top,
body.pre-start #hud-bottom,
body.pre-start #crosshair,
body.pre-start #interact-prompt,
body.pre-start #foley-panel {
  opacity: 0 !important;
  pointer-events: none !important;
}

#start-screen {
  position: fixed; inset: 0;
  background: radial-gradient(circle at center, rgba(6, 7, 11, 0.58) 0%, rgba(2, 2, 4, 0.92) 100%);
  display: flex; align-items: center; justify-content: center; padding: 24px;
  z-index: 32; transition: opacity 0.85s ease;
}
#start-screen.hidden { opacity: 0; pointer-events: none; }

.title-wrap {
  text-align: center; max-width: 520px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.title-kicker {
  font-family: monospace; font-size: 13px; letter-spacing: 0.28em;
  color: rgba(240, 123, 114, 0.9); text-transform: uppercase;
}
.title-main {
  margin: 0; font-family: 'Lora', 'Times New Roman', serif; font-weight: 600;
  font-size: clamp(46px, 8vw, 76px); line-height: 1.05; letter-spacing: 0.08em;
  color: #f4f1ea; text-shadow: 0 8px 36px rgba(0, 0, 0, 0.9);
}
.title-sub {
  margin: -4px 0 4px; font-family: 'Lora', 'Times New Roman', serif; font-style: italic;
  font-size: clamp(18px, 2.8vw, 24px); color: #d5cfc3; font-weight: 400;
}
.title-desc {
  margin: 0 0 12px; font-size: 14.5px; line-height: 1.65; color: var(--mute); max-width: 420px;
}
.title-hint {
  margin-top: 10px; font-size: 12px; color: rgba(163, 158, 147, 0.72); letter-spacing: 0.04em;
}

.wake-btn {
  padding: 14px 46px; background: rgba(16, 17, 22, 0.9); color: #f6f3ec;
  border: 1px solid rgba(232, 155, 76, 0.62); border-radius: 999px;
  font-family: 'Be Vietnam Pro', system-ui, sans-serif; font-size: 15px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  cursor: pointer; transition: background 0.22s, border-color 0.22s, transform 0.15s;
  box-shadow: 0 0 38px rgba(0, 0, 0, 0.85);
}
.wake-btn:hover {
  background: rgba(232, 155, 76, 0.22); border-color: var(--amber-bright); transform: scale(1.03);
}

.start-sub-btn {
  padding: 9px 22px; background: rgba(12, 13, 18, 0.75); color: var(--mute);
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 999px;
  font-size: 13px; letter-spacing: 0.04em; cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
}
.start-sub-btn:hover {
  color: var(--amber-bright); border-color: rgba(232, 155, 76, 0.45);
  background: rgba(232, 155, 76, 0.12);
}

/* Black-and-white intro screen */
#intro-screen {
  position: fixed; inset: 0; background: #000000;
  display: flex; align-items: center; justify-content: center; flex-direction: column;
  padding: 28px; z-index: 35;
  opacity: 0; pointer-events: none; transition: opacity 0.9s ease;
}
#intro-screen.active { opacity: 1; pointer-events: auto; }
.intro-content {
  max-width: 560px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 22px;
}
.intro-line {
  margin: 0; font-family: 'Lora', 'Times New Roman', serif;
  font-size: clamp(19px, 3vw, 25px); line-height: 1.65; color: #ffffff;
  opacity: 0; transform: translateY(8px);
  transition: opacity 1.1s ease, transform 1.1s ease;
}
.intro-line.show { opacity: 1; transform: translateY(0); }
.intro-line.intro-date {
  margin-top: 8px; font-family: monospace; font-size: 14px; letter-spacing: 0.26em;
  color: rgba(255, 255, 255, 0.68); text-transform: uppercase;
}
#intro-skip {
  position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
  font-size: 12px; color: rgba(255, 255, 255, 0.42); letter-spacing: 0.08em;
  background: transparent; border: none; cursor: pointer;
}
#intro-skip:hover { color: rgba(255, 255, 255, 0.78); }

/* Eyelid blink overlay for waking up groggily */
#eyelid-top, #eyelid-bottom {
  position: fixed; left: 0; right: 0; height: 50vh;
  background: #010102; pointer-events: none; z-index: 28;
  transform: translateY(-100%); will-change: transform;
}
#eyelid-top {
  top: 0;
  box-shadow: 0 28px 46px rgba(1, 1, 2, 0.96);
}
#eyelid-bottom {
  bottom: 0;
  transform: translateY(100%);
  box-shadow: 0 -28px 46px rgba(1, 1, 2, 0.96);
}
#eye-haze {
  position: fixed; inset: 0; pointer-events: none; z-index: 27;
  background: rgba(2, 3, 5, 0.85); opacity: 0;
}
#light-whiteout {
  position: fixed; inset: 0; pointer-events: none; z-index: 26;
  background: radial-gradient(circle at center, #ffffff 0%, #fffaf0 58%, #ffecc7 100%);
  opacity: 0; transition: opacity 0.12s linear;
}
#subtitle-box.warm-voice {
  background: rgba(22, 18, 14, 0.78);
  border-left-color: #ffe2a8;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  transition: opacity 0.85s ease;
  z-index: 29;
}

.overlay-screen {
  position: fixed; inset: 0; background: rgba(4, 5, 8, 0.88); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 30;
  transition: opacity 0.35s ease;
}
.overlay-screen.hidden { opacity: 0; pointer-events: none; }

#ending-screen {
  background: radial-gradient(circle at center, rgba(255, 253, 248, 0.96) 0%, rgba(255, 245, 228, 0.98) 100%);
  backdrop-filter: none;
  transition: opacity 1.8s ease;
}

#ending-screen.ending-normal {
  background: radial-gradient(circle at center, rgba(226, 232, 238, 0.97) 0%, rgba(196, 206, 218, 0.98) 100%);
}
#ending-screen.ending-bad {
  background: radial-gradient(circle at center, rgba(24, 8, 10, 0.97) 0%, rgba(5, 3, 5, 0.99) 100%);
}
#ending-screen.ending-bad .the-end-title {
  color: #f05a50;
  text-shadow: 0 0 28px rgba(212, 77, 66, 0.65);
}
#ending-screen.ending-bad .the-end-date {
  color: rgba(240, 123, 114, 0.85);
}
#ending-screen.ending-bad .the-end-body {
  color: #cfc6be;
}
#ending-screen.ending-bad .the-end-badge {
  color: #ff8e86; border-color: rgba(240, 90, 80, 0.45); background: rgba(212, 77, 66, 0.12);
}
#ending-screen.ending-bad .ending-action-row {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px;
}
.ending-action-row .the-end-btn { margin-top: 0; }
.retry-loop-btn.hidden { display: none; }
#ending-screen.ending-bad .retry-loop-btn {
  background: rgba(232, 155, 76, 0.2); border-color: var(--amber); color: var(--amber-bright); font-weight: 600;
}
#ending-screen.ending-bad .retry-loop-btn:hover {
  background: rgba(232, 155, 76, 0.34); border-color: var(--amber-bright); color: #fff;
}

.the-end-btn {
  color: #f0ece3; border-color: rgba(240, 236, 227, 0.35);
}
#ending-screen.ending-bad .the-end-btn:hover {
  background: rgba(240, 90, 80, 0.16); border-color: #f05a50; color: #ffffff;
}
.the-end-badge {
  display: inline-block; padding: 4px 12px; border-radius: 999px;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: #6b4e2e; background: rgba(232, 155, 76, 0.16); border: 1px solid rgba(168, 116, 56, 0.35);
}
.the-end-body {
  max-width: 480px; margin: 4px 0 0; font-family: 'Lora', 'Times New Roman', serif;
  font-style: italic; font-size: 15px; line-height: 1.65; color: #463a2e;
}
.ending-switch-row {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 14px;
}
.ending-switch-btn {
  padding: 6px 13px; border-radius: 999px; font-size: 12px; cursor: pointer;
  background: rgba(128, 128, 128, 0.12); border: 1px solid rgba(128, 128, 128, 0.3);
  color: inherit; opacity: 0.78; transition: opacity 0.15s, border-color 0.15s;
}
.ending-switch-btn:hover, .ending-switch-btn.active {
  opacity: 1; border-color: var(--amber);
}
#ending-screen:not(.ending-bad) .ending-switch-btn { color: #3a3026; }
#ending-screen.ending-bad .ending-switch-btn { color: #e2dad2; }

.the-end-wrap {
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.the-end-title {
  margin: 0;
  font-family: 'Lora', 'Times New Roman', serif;
  font-weight: 500;
  font-style: italic;
  font-size: clamp(44px, 7.5vw, 72px);
  letter-spacing: 0.14em;
  color: #2b241d;
  text-shadow: 0 2px 24px rgba(255, 255, 255, 0.9);
}
.the-end-date {
  font-family: monospace;
  font-size: 12.5px;
  letter-spacing: 0.24em;
  color: rgba(82, 68, 54, 0.65);
  text-transform: uppercase;
}
.the-end-btn {
  margin-top: 22px;
  padding: 10px 26px;
  background: transparent;
  color: #4a3d30;
  border: 1px solid rgba(74, 61, 48, 0.3);
  border-radius: 999px;
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  font-size: 13px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.25s, border-color 0.25s, color 0.25s;
}
.the-end-btn:hover {
  background: rgba(74, 61, 48, 0.08);
  border-color: rgba(74, 61, 48, 0.65);
  color: #241c15;
}
#subtitle-continue {
  margin-top: 10px;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  color: rgba(255, 230, 180, 0.78);
  text-transform: uppercase;
  display: none;
}
#subtitle-box.voicemail-hold {
  pointer-events: auto;
  cursor: pointer;
}
#subtitle-box.voicemail-hold #subtitle-continue {
  display: block;
}

/* Close-up phone screen cut on The End */
.phone-cut {
  margin-top: 26px;
  width: min(310px, 88vw);
  padding: 18px 20px 20px;
  background: linear-gradient(160deg, #15171c 0%, #0b0c10 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  box-shadow: 0 22px 54px rgba(32, 24, 16, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  color: #f2efe9;
  text-align: left;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 1.5s ease, transform 1.5s ease;
}
.phone-cut.show {
  opacity: 1;
  transform: translateY(0);
}
.phone-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: monospace;
  font-size: 11px;
  color: rgba(242, 239, 233, 0.55);
  margin-bottom: 14px;
}
.phone-notch {
  width: 52px;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}
.phone-vm-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}
.phone-vm-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(232, 168, 96, 0.16);
  border: 1px solid rgba(232, 168, 96, 0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f7c37c;
  font-size: 13px;
  flex-shrink: 0;
}
.phone-vm-meta {
  flex: 1;
  min-width: 0;
}
.phone-vm-title {
  font-size: 13px;
  font-weight: 500;
  color: #f5f2eb;
  letter-spacing: 0.02em;
}
.phone-vm-bar {
  margin-top: 7px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
}
.phone-vm-bar-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e89b4c, #f7d59c);
}

.modal-card {
  width: min(540px, 100%); max-height: 88vh; overflow-y: auto; padding: 32px 28px;
  background: rgba(14, 16, 21, 0.96); border: 1px solid rgba(232, 155, 76, 0.34); border-radius: 14px;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.85);
}

.modal-kicker {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em;
  color: var(--amber); margin-bottom: 8px;
}

.modal-card h2 {
  margin: 0 0 12px; font-family: 'Lora', 'Times New Roman', serif; font-weight: 600;
  font-size: clamp(24px, 4vw, 32px); line-height: 1.24; color: var(--ink);
}

.modal-card p { margin: 0 0 16px; font-size: 15px; line-height: 1.68; color: var(--mute); }

.primary-btn {
  display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px;
  background: var(--amber); color: #120d07; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer;
}
.primary-btn:hover { background: var(--amber-bright); }


.timeline-strip {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
  margin: 0 0 18px;
}
.timeline-node {
  padding: 8px 6px; border-radius: 8px; text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.5; transition: all 0.2s ease;
}
.timeline-node.unlocked {
  opacity: 1;
  background: rgba(232, 155, 76, 0.14);
  border-color: rgba(232, 155, 76, 0.52);
}
.timeline-time {
  font-family: monospace; font-size: 12px; font-weight: 700; color: var(--amber-bright);
}
.timeline-tag {
  font-size: 10.5px; color: var(--ink); margin-top: 3px; line-height: 1.25;
}
@media (max-width: 560px) {
  .timeline-strip { grid-template-columns: repeat(2, 1fr); }
}

.journal-entry {
  padding: 14px 16px; margin-bottom: 12px; background: rgba(255, 255, 255, 0.03);
  border-left: 2px solid var(--amber); border-radius: 6px;
}
.journal-entry h3 { margin: 0 0 6px; font-size: 15px; color: var(--amber-bright); }
.journal-entry p {
  margin: 0; font-size: 14px; color: var(--ink);
  font-family: 'Lora', 'Times New Roman', serif; font-style: italic;
}


#settings-screen { z-index: 40; }

#keypad-screen { z-index: 41; }
.keypad-card {
  width: min(370px, 100%); text-align: center;
}
.keypad-display {
  margin: 14px auto 16px; padding: 14px 18px;
  background: #07080b; border: 1px solid rgba(232, 155, 76, 0.42);
  border-radius: 10px; font-family: monospace; font-size: 32px;
  letter-spacing: 0.36em; color: var(--amber-bright);
  text-shadow: 0 0 14px rgba(232, 155, 76, 0.45);
  min-height: 62px; display: flex; align-items: center; justify-content: center;
}
.keypad-display.error {
  border-color: var(--red); color: #ff6b63;
  animation: keypadShake 0.32s ease;
}
@keyframes keypadShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-7px); }
  75% { transform: translateX(7px); }
}
.keypad-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px;
  margin-bottom: 14px;
}
.keypad-btn {
  padding: 13px 0; background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px;
  color: var(--ink); font-family: monospace; font-size: 20px; font-weight: 700;
  cursor: pointer; transition: background 0.15s, border-color 0.15s, transform 0.08s;
}
.keypad-btn:hover { background: rgba(232, 155, 76, 0.18); border-color: var(--amber); }
.keypad-btn:active { transform: scale(0.95); }
.keypad-btn.action {
  font-family: 'Be Vietnam Pro', sans-serif; font-size: 13px; color: var(--amber-bright);
}
.keypad-msg {
  min-height: 20px; font-size: 12.5px; color: var(--mute); margin: 0 0 12px !important;
}
.keypad-msg.err { color: #ff6b63; }


.secondary-btn {
  display: inline-flex; align-items: center; justify-content: center; padding: 11px 18px;
  background: rgba(255, 255, 255, 0.05); color: var(--ink);
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px;
  font-size: 13.5px; font-weight: 500; cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.secondary-btn:hover { border-color: var(--amber); background: rgba(232, 155, 76, 0.1); }

/* Bảng Cài đặt (Settings) */
.settings-section {
  padding: 14px 16px; margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
}
.settings-label-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px; gap: 10px;
}
.settings-label {
  font-size: 13.5px; font-weight: 600; color: var(--ink);
}
.settings-hint {
  font-size: 12px; color: var(--mute); margin: 8px 0 0 !important; line-height: 1.5 !important;
}
.seg-group {
  display: grid; gap: 8px;
}
.seg-3 { grid-template-columns: repeat(3, 1fr); }
.seg-4 { grid-template-columns: repeat(4, 1fr); }

.seg-btn {
  padding: 9px 8px; background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px;
  color: var(--mute); font-size: 12.5px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease; text-align: center;
}
.seg-btn:hover { border-color: rgba(232, 155, 76, 0.5); color: var(--ink); }
.seg-btn.active {
  background: rgba(232, 155, 76, 0.2); border-color: var(--amber);
  color: var(--amber-bright); box-shadow: 0 0 14px rgba(232, 155, 76, 0.18);
}

/* Công tắc bật/tắt (Toggle Switch) */
.toggle-row {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 6px 0;
}
.toggle-row + .toggle-row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 8px; padding-top: 12px;
}
.toggle-switch {
  position: relative; width: 46px; height: 26px; flex-shrink: 0;
  background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
  padding: 0;
}
.toggle-switch::after {
  content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  border-radius: 50%; background: var(--mute); transition: transform 0.2s, background 0.2s;
}
.toggle-switch.on {
  background: rgba(232, 155, 76, 0.35); border-color: var(--amber);
}
.toggle-switch.on::after {
  transform: translateX(20px); background: var(--amber-bright);
}

/* Thanh trượt độ nhạy chuột */
.range-slider {
  width: 100%; accent-color: var(--amber); cursor: pointer; height: 6px;
}
.sens-value {
  font-family: monospace; font-size: 13px; font-weight: 700; color: var(--amber-bright);
}


.settings-btn-row {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
}
.settings-btn-row .hud-btn,
.settings-btn-row .hud-select {
  flex: 1 1 130px; text-align: center; max-width: none;
  background: rgba(255, 255, 255, 0.045);
}

.modal-actions {
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
  margin-top: 18px; flex-wrap: wrap;
}

@media (max-width: 720px) {
  .controls-hint { display: none; }
  #touch-pad { display: grid; }
  .hud-pill { font-size: 12px; padding: 5px 8px; }
  .bar-track { width: 48px; }
  .seg-4 { grid-template-columns: repeat(2, 1fr); }
}


/* =========================================================
   CRISP UI & HIGH-DETAIL VISUAL POLISH
   ========================================================= */
html, body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

canvas {
  display: block;
}

/* Custom sleek dark scrollbar for modals */
.modal-card::-webkit-scrollbar { width: 6px; }
.modal-card::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.03); border-radius: 999px; }
.modal-card::-webkit-scrollbar-thumb { background: rgba(232, 155, 76, 0.35); border-radius: 999px; }
.modal-card::-webkit-scrollbar-thumb:hover { background: rgba(232, 155, 76, 0.58); }

/* Sharper HUD pills & buttons (even when blur is off in Low mode) */
.hud-pill {
  background: rgba(10, 12, 17, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 4px 16px rgba(0, 0, 0, 0.5);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}
.clock-pill {
  border-color: rgba(224, 92, 82, 0.48);
  color: #ff9188;
  text-shadow: 0 0 10px rgba(212, 77, 66, 0.35);
}
.anomaly-pill {
  border-color: rgba(232, 155, 76, 0.55);
  background: rgba(24, 17, 10, 0.88);
}
.anomaly-pill.done {
  border-color: rgba(105, 199, 138, 0.62);
  background: rgba(11, 24, 17, 0.88);
}
.fps-pill {
  font-variant-numeric: tabular-nums;
  border-color: rgba(105, 199, 138, 0.45);
}

.bar-track {
  width: 68px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
}
#fear-bar {
  background: linear-gradient(90deg, #5da4a0, #8fd2ce);
  box-shadow: 0 0 8px rgba(126, 176, 173, 0.45);
}
#match-bar {
  background: linear-gradient(90deg, #d9822b, #f7c37c);
  box-shadow: 0 0 8px rgba(232, 155, 76, 0.5);
}

.hud-btn {
  background: rgba(12, 14, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 14px rgba(0, 0, 0, 0.45);
  font-weight: 500;
  transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease, transform 0.1s ease;
}
.hud-btn:hover {
  border-color: rgba(247, 195, 124, 0.72);
  background: rgba(232, 155, 76, 0.14);
  color: #fff8ee;
}
.hud-btn:active { transform: translateY(1px); }

/* High-contrast crisp crosshair & interact prompt */
#crosshair {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: rgba(248, 244, 236, 0.82);
  box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.75);
}
#crosshair.active {
  transform: scale(1.85);
  background: var(--amber-bright);
  box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.8), 0 0 14px rgba(247, 195, 124, 0.95);
}
#interact-prompt {
  padding: 7px 16px;
  background: rgba(9, 10, 15, 0.94);
  border: 1px solid rgba(232, 155, 76, 0.56);
  box-shadow: inset 0 1px 0 rgba(255, 224, 178, 0.14), 0 8px 24px rgba(0, 0, 0, 0.72);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #ffe0ad;
}

/* Subtitle box sharper framing & readability */
#subtitle-box {
  background: rgba(7, 8, 12, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid var(--amber);
  border-radius: 10px;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.78);
}
#subtitle-speaker {
  font-weight: 700;
  letter-spacing: 0.14em;
}
#subtitle-text {
  font-size: 16.5px;
  color: #f6f2ea;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Bottom controls & action buttons */
.controls-hint {
  padding: 7px 14px;
  background: rgba(9, 11, 16, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 16px rgba(0, 0, 0, 0.5);
  color: #bcb6aa;
}
.controls-hint kbd {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.65);
  color: #f7f3eb;
  font-weight: 600;
}
.action-btn {
  padding: 9px 15px;
  background: rgba(14, 15, 21, 0.92);
  border: 1px solid rgba(232, 155, 76, 0.48);
  box-shadow: inset 0 1px 0 rgba(255, 224, 178, 0.12), 0 6px 18px rgba(0, 0, 0, 0.55);
  transition: background 0.16s ease, border-color 0.16s ease, transform 0.1s ease;
}
.action-btn:hover {
  background: rgba(232, 155, 76, 0.22);
  border-color: var(--amber-bright);
  color: #fff6e6;
}
.action-btn:active { transform: translateY(1px); }
.pad-btn {
  background: rgba(12, 14, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0, 0, 0, 0.5);
}
.pad-btn:active {
  background: rgba(232, 155, 76, 0.25);
  border-color: var(--amber-bright);
}

/* Crisp atmospheric Start Screen */
#start-screen {
  background: radial-gradient(circle at 50% 42%, rgba(14, 16, 24, 0.52) 0%, rgba(4, 5, 8, 0.88) 65%, rgba(2, 2, 4, 0.96) 100%);
}
.title-wrap {
  position: relative;
  padding: 36px 40px 32px;
  background: linear-gradient(180deg, rgba(11, 13, 19, 0.78) 0%, rgba(7, 8, 12, 0.88) 100%);
  border: 1px solid rgba(232, 155, 76, 0.24);
  border-radius: 18px;
  box-shadow:
    inset 0 1px 0 rgba(255, 232, 196, 0.1),
    0 28px 80px rgba(0, 0, 0, 0.85),
    0 0 60px rgba(232, 155, 76, 0.06);
  max-width: 540px;
}
.title-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(212, 77, 66, 0.12);
  border: 1px solid rgba(240, 123, 114, 0.34);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: #ff9a91;
}
.title-main {
  font-size: clamp(54px, 8.5vw, 84px);
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
  color: #faf7f0;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.8), 0 12px 40px rgba(0, 0, 0, 0.95), 0 0 32px rgba(232, 155, 76, 0.18);
}
.title-sub {
  margin: -6px 0 6px;
  font-size: clamp(19px, 2.8vw, 25px);
  color: #e8c79b;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.85);
}
.title-desc {
  margin: 0 0 14px;
  font-size: 14.5px;
  line-height: 1.7;
  color: #cdc7bc;
  max-width: 430px;
}
.wake-btn {
  padding: 14px 52px;
  background: linear-gradient(180deg, rgba(232, 155, 76, 0.24) 0%, rgba(168, 96, 36, 0.22) 100%);
  color: #fff9ef;
  border: 1px solid rgba(247, 195, 124, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 236, 204, 0.32), 0 10px 30px rgba(0, 0, 0, 0.72), 0 0 24px rgba(232, 155, 76, 0.16);
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.14s ease, box-shadow 0.2s ease;
}
.wake-btn:hover {
  background: linear-gradient(180deg, rgba(247, 195, 124, 0.36) 0%, rgba(212, 128, 48, 0.3) 100%);
  border-color: #ffe0ad;
  box-shadow: inset 0 1px 0 rgba(255, 245, 224, 0.45), 0 12px 34px rgba(0, 0, 0, 0.8), 0 0 32px rgba(232, 155, 76, 0.32);
  transform: translateY(-1px) scale(1.02);
}
.wake-btn:active { transform: translateY(1px) scale(0.99); }
.title-hint {
  margin-top: 8px;
  padding-top: 14px;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  color: #a9a397;
  letter-spacing: 0.03em;
  line-height: 1.6;
}

/* Sharper Modals (Settings, Journal, Keypad) */
.modal-card {
  background: linear-gradient(180deg, rgba(16, 18, 25, 0.98) 0%, rgba(11, 13, 18, 0.98) 100%);
  border: 1px solid rgba(232, 155, 76, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 232, 196, 0.1), 0 32px 84px rgba(0, 0, 0, 0.9);
}
.settings-section {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
}
.seg-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #c2bcb0;
}
.seg-btn.active {
  background: rgba(232, 155, 76, 0.24);
  border-color: var(--amber-bright);
  color: #fff3dd;
  box-shadow: inset 0 1px 0 rgba(255, 232, 196, 0.25), 0 0 16px rgba(232, 155, 76, 0.22);
}
.primary-btn {
  background: linear-gradient(180deg, #f3b264 0%, #df8e3b 100%);
  box-shadow: inset 0 1px 0 rgba(255, 245, 224, 0.45), 0 4px 14px rgba(232, 155, 76, 0.3);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.primary-btn:hover { filter: brightness(1.08); }
.primary-btn:active { transform: translateY(1px); }

/* Fix Bad Ending button contrast bug */
#ending-screen.ending-bad .the-end-btn {
  color: #f4efe6;
  border-color: rgba(240, 236, 227, 0.42);
  background: rgba(255, 255, 255, 0.04);
}
#ending-screen.ending-bad .the-end-btn:hover {
  background: rgba(240, 90, 80, 0.2);
  border-color: #ff7a70;
  color: #ffffff;
}

@media (max-width: 560px) {
  .title-wrap { padding: 26px 22px 24px; }
}

/* =========================================================
   OPTION C: SUBTLE MORAL CHOICE MODAL & CHOICE SUMMARY CHIPS
   ========================================================= */
#choice-screen { z-index: 43; }
.choice-card {
  width: min(500px, 100%);
  text-align: left;
  border-color: rgba(232, 155, 76, 0.34);
}
.choice-prompt {
  font-family: 'Lora', 'Times New Roman', serif;
  font-style: italic;
  font-size: 15.5px !important;
  line-height: 1.72 !important;
  color: #e6dfd3 !important;
  margin-bottom: 18px !important;
}
.choice-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.choice-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 15px 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.choice-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(232, 155, 76, 0.52);
  background: rgba(232, 155, 76, 0.09);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
}
.choice-btn:active {
  transform: translateY(0);
}
.choice-label {
  font-size: 15px;
  font-weight: 600;
  color: #f6f2ea;
}
.choice-sub {
  font-size: 12.5px;
  color: #aba498;
  line-height: 1.5;
}

.journal-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 14px;
}
.choice-chip {
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.045);
  color: #dcd5c9;
}

.ending-choices-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  max-width: 520px;
  margin-top: 2px;
}
#ending-screen:not(.ending-bad) .choice-chip {
  color: #4a3d30;
  background: rgba(74, 61, 48, 0.08);
  border-color: rgba(74, 61, 48, 0.25);
}

/* =========================================================
   HPL PHYSICS: TACTILE GRAB CROSSHAIR & HAND FEEDBACK
   ========================================================= */
#crosshair.grab {
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  background: transparent;
  border: 2px solid var(--amber-bright);
  box-shadow: 0 0 10px rgba(232, 155, 76, 0.75);
}
#crosshair.holding {
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  background: rgba(247, 195, 124, 0.35);
  border: 2px solid #fff3dd;
  box-shadow: 0 0 14px rgba(247, 195, 124, 0.95);
  transform: scale(1.1);
}
#hpl-hint {
  position: fixed;
  top: calc(50% + 56px);
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 13px;
  background: rgba(8, 10, 14, 0.9);
  border: 1px solid rgba(247, 195, 124, 0.45);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #f6e7cf;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.16s ease;
  z-index: 12;
  white-space: nowrap;
}
#hpl-hint.visible {
  opacity: 1;
}

/* WebGL Error Modal */
#webgl-error-modal {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(10, 12, 18, 0.94) 0%, rgba(2, 2, 4, 0.98) 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.webgl-error-card {
  max-width: 620px;
  width: 100%;
  background: rgba(18, 20, 28, 0.95);
  border: 1px solid rgba(255, 90, 80, 0.45);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 70, 60, 0.15);
  border-radius: 12px;
  padding: 32px 36px;
  text-align: center;
  color: #eceff4;
}

.webgl-error-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 70, 60, 0.18);
  border: 1px solid rgba(255, 90, 80, 0.6);
  border-radius: 999px;
  color: #ff7675;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.webgl-error-heading {
  font-size: 22px;
  color: #f7d794;
  margin: 0 0 14px;
  font-weight: 600;
  line-height: 1.35;
}

.webgl-error-msg {
  font-size: 14px;
  color: #c8d1dc;
  line-height: 1.6;
  margin-bottom: 22px;
}

.webgl-steps-box {
  background: rgba(8, 10, 15, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 18px 20px;
  text-align: left;
  margin-bottom: 24px;
}

.webgl-steps-title {
  color: #f7d794;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.webgl-step-item {
  font-size: 13px;
  color: #d1d8e0;
  line-height: 1.65;
  margin-bottom: 10px;
}

.webgl-step-item:last-child {
  margin-bottom: 0;
}

.webgl-code-copy {
  display: inline-block;
  background: #11141c;
  color: #70a1ff;
  border: 1px solid rgba(112, 161, 255, 0.25);
  padding: 3px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  margin-top: 4px;
}

.webgl-btn-row {
  display: flex;
  justify-content: center;
  gap: 14px;
}

/* === PHASE 3: CONTINUE BUTTON & AUTO-PAUSE OVERLAY === */
.start-btn-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

.wake-btn.continue-btn {
  background: linear-gradient(135deg, rgba(214, 154, 82, 0.28), rgba(168, 96, 46, 0.36));
  border-color: rgba(240, 189, 122, 0.65);
  color: #fff3de;
}

.wake-btn.continue-btn:hover {
  background: linear-gradient(135deg, rgba(232, 168, 92, 0.42), rgba(186, 108, 52, 0.48));
  border-color: rgba(255, 214, 158, 0.9);
}

.pause-card {
  max-width: 420px;
  text-align: center;
}

.pause-sub {
  font-size: 14px;
  color: rgba(235, 226, 212, 0.78);
  margin: 8px 0 22px;
  line-height: 1.55;
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pause-actions button {
  width: 100%;
}

/* === MINIMAL HORROR HUD (CLEAN & UNOBTRUSIVE) === */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

#hud-top {
  top: 14px;
  left: 18px;
  right: 18px;
  align-items: flex-start;
}

.hud-minimal-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  pointer-events: none;
}

.hud-status-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12.5px;
  color: rgba(235, 228, 218, 0.72);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.92), 0 0 2px rgba(0, 0, 0, 0.95);
  letter-spacing: 0.02em;
  user-select: none;
}

.hud-clock {
  font-family: monospace;
  color: rgba(242, 128, 118, 0.9);
  font-weight: 600;
}

.hud-dot {
  opacity: 0.38;
}

.hud-anomaly {
  color: rgba(240, 184, 112, 0.88);
  font-weight: 500;
}

.hud-anomaly.done {
  color: rgba(126, 214, 156, 0.92);
}

.hud-match-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.match-track {
  display: inline-block;
  width: 42px;
  height: 4px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  overflow: hidden;
  vertical-align: middle;
}

.match-track .bar-fill {
  display: block;
  height: 100%;
}

.hud-fps {
  font-family: monospace;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--green);
  margin-left: 4px;
}
.hud-fps.hidden { display: none; }
.hud-fps.fps-mid { color: var(--amber-bright); }
.hud-fps.fps-low { color: #ff6b63; }

.objective-toast {
  max-width: min(460px, 72vw);
  font-size: 12.5px;
  line-height: 1.45;
  color: rgba(245, 236, 222, 0.88);
  padding: 5px 10px;
  border-left: 2px solid rgba(232, 155, 76, 0.72);
  background: linear-gradient(90deg, rgba(8, 10, 14, 0.62), rgba(8, 10, 14, 0));
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.92);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.45s ease, transform 0.45s ease;
  pointer-events: none;
}

.objective-toast.visible {
  opacity: 1;
  transform: translateY(0);
}

.hud-minimal-right {
  display: flex;
  gap: 6px;
  pointer-events: auto;
}

.hud-ghost-btn {
  padding: 4px 9px;
  background: rgba(8, 10, 14, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(235, 228, 218, 0.62);
  font-size: 11.5px;
  cursor: pointer;
  transition: opacity 0.2s, color 0.2s, border-color 0.2s, background 0.2s;
}

.hud-ghost-btn:hover {
  color: var(--ink);
  border-color: rgba(232, 155, 76, 0.6);
  background: rgba(12, 14, 20, 0.72);
}

/* Hide bottom desktop hints & click buttons by default; show only on touch devices or when touch pad is toggled */
#hud-bottom .controls-hint,
#hud-bottom .action-buttons {
  display: none;
}

@media (hover: none) and (pointer: coarse) {
  #hud-bottom .action-buttons {
    display: flex;
  }
}

#touch-pad.visible ~ .action-buttons {
  display: flex;
}

#hpl-hint {
  display: none !important;
}

#subtitle-box {
  bottom: 34px;
}

#canvas-container canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
```

---

### <a id="src-ui-hud-js"></a> Tập tin: `src/ui/hud.js` (66 dòng)

```javascript
import { TOTAL_LOOPS } from '../config/storyData.js';

export function createHudCache() {
  return {
    loop: -1,
    fearPct: -1,
    fearBg: '',
    vignetteOp: '',
    matchCount: -1,
    matchBarW: '',
    interactActive: false,
    interactText: '',
    dangerOp: '',
    anomalyStr: ''
  };
}

export function updateHUD(state, hudCache, els) {
  if (hudCache.loop !== state.loop) {
    hudCache.loop = state.loop;
    els.loopLabel.textContent = state.loop >= 3
      ? `Vòng ${state.loop}/${TOTAL_LOOPS} · 14/11 · 02:14`
      : `Vòng ${state.loop}/${TOTAL_LOOPS} · 02:14`;
  }
  const f = Math.round(state.fear);
  if (hudCache.fearPct !== f) {
    hudCache.fearPct = f;
    els.fearPct.textContent = `${f}%`;
    els.fearBar.style.width = `${f}%`;
    const bg = f > 70 ? '#d44d42' : f > 40 ? '#e89b4c' : '#7eb0ad';
    if (hudCache.fearBg !== bg) {
      hudCache.fearBg = bg;
      els.fearBar.style.background = bg;
    }
    const vigOp = (0.55 + (f / 100) * 0.42).toFixed(2);
    if (hudCache.vignetteOp !== vigOp) {
      hudCache.vignetteOp = vigOp;
      els.fearVignette.style.opacity = vigOp;
    }
  }
  if (hudCache.matchCount !== state.matchesLeft) {
    hudCache.matchCount = state.matchesLeft;
    els.matchCountEl.textContent = String(state.matchesLeft);
  }
  const mbW = `${Math.round((state.matchTimer / state.matchMax) * 100)}%`;
  if (hudCache.matchBarW !== mbW) {
    hudCache.matchBarW = mbW;
    els.matchBar.style.width = mbW;
  }
  const aStr = `Dấu vết: ${Math.min(state.anomaliesFound, state.anomaliesRequired)}/${state.anomaliesRequired}`;
  if (hudCache.anomalyStr !== aStr) {
    hudCache.anomalyStr = aStr;
    els.anomalyLabel.textContent = aStr;
    els.anomalyPill.classList.toggle('done', state.anomaliesFound >= state.anomaliesRequired);
  }
}

export function clearInteractUI(hudCache, els) {
  if (hudCache.interactActive) {
    hudCache.interactActive = false;
    hudCache.interactText = '';
    els.crosshair.classList.remove('active');
    els.interactPrompt.classList.remove('visible');
  }
}
```

---

### <a id="src-ui-journal-js"></a> Tập tin: `src/ui/journal.js` (78 dòng)

```javascript
import { TIMELINE_STEPS } from '../config/storyData.js';

export function renderJournal(state, els) {
  if (els.journalTimeline) {
    els.journalTimeline.replaceChildren();
    TIMELINE_STEPS.forEach((step) => {
      const unlocked = state.loop > step.loop || (state.loop === step.loop && state.loopClueFound);
      const node = document.createElement('div');
      node.className = 'timeline-node' + (unlocked ? ' unlocked' : '');

      const timeEl = document.createElement('div');
      timeEl.className = 'timeline-time';
      timeEl.textContent = `${unlocked ? '✓ ' : ''}${step.time}`;

      const tagEl = document.createElement('div');
      tagEl.className = 'timeline-tag';
      tagEl.textContent = unlocked ? step.short : '???';

      node.append(timeEl, tagEl);
      els.journalTimeline.appendChild(node);
    });
  }

  if (els.journalChoices) {
    els.journalChoices.replaceChildren();
    state.choices.forEach((c) => {
      const span = document.createElement('span');
      span.className = 'choice-chip';
      span.textContent = c.chip;
      els.journalChoices.appendChild(span);
    });
  }

  if (!els.journalList) return;
  els.journalList.replaceChildren();

  if (state.journalNotes.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.textContent = 'Chưa có mảnh ghi chép nào được mở khóa.';
    els.journalList.appendChild(emptyP);
    return;
  }

  state.journalNotes.forEach((n) => {
    const div = document.createElement('div');
    div.className = 'journal-entry';

    const h3 = document.createElement('h3');
    h3.textContent = n.title;

    const p = document.createElement('p');
    p.textContent = n.text;

    div.append(h3, p);
    els.journalList.appendChild(div);
  });
}

export function toggleJournal(state, els, renderJournalFn, clearKeysFn) {
  if (!state.running || state.ended) return;
  if (els.settingsScreen && !els.settingsScreen.classList.contains('hidden')) {
    els.settingsScreen.classList.add('hidden');
  }
  if (els.pauseOverlay && !els.pauseOverlay.classList.contains('hidden')) {
    els.pauseOverlay.classList.add('hidden');
  }
  const opening = els.journalScreen.classList.contains('hidden');
  state.paused = opening;
  if (opening) {
    if (document.pointerLockElement) document.exitPointerLock();
    clearKeysFn();
    renderJournalFn();
    els.journalScreen.classList.remove('hidden');
  } else {
    els.journalScreen.classList.add('hidden');
  }
}
```

---

### <a id="src-ui-keypad-js"></a> Tập tin: `src/ui/keypad.js` (103 dòng)

```javascript
import { TOTAL_LOOPS, LOOP_STORY } from "../config/storyData.js";

export function createKeypadController(els, state, audio, callbacks) {
  let keypadCode = "";

  function renderKeypad() {
    els.keypadDisplay.textContent = keypadCode.padEnd(4, "-");
    els.keypadDisplay.classList.remove("error");
  }

  function openKeypad() {
    if (!state.running || state.ended) return;
    keypadCode = "";
    renderKeypad();
    els.keypadMsg.textContent = "Gõ phím số hoặc bấm trực tiếp bên dưới.";
    els.keypadMsg.classList.remove("err");
    state.paused = true;
    if (document.pointerLockElement) document.exitPointerLock();
    if (callbacks.clearKeys) callbacks.clearKeys();
    els.keypadScreen.classList.remove("hidden");
  }

  function closeKeypad() {
    els.keypadScreen.classList.add("hidden");
    if (
      state.running &&
      !state.ended &&
      els.settingsScreen.classList.contains("hidden") &&
      els.journalScreen.classList.contains("hidden")
    ) {
      state.paused = false;
    }
  }

  function submitKeypad() {
    if (keypadCode === "0214" || keypadCode === "1411") {
      state.codeUnlocked = true;
      closeKeypad();
      state.loopClueFound = true;
      if (callbacks.onCodeSuccess) callbacks.onCodeSuccess();
    } else {
      audio.playDoorSlam();
      els.keypadDisplay.classList.remove("error");
      void els.keypadDisplay.offsetWidth;
      els.keypadDisplay.classList.add("error");
      els.keypadMsg.textContent =
        "Sai mật mã! Gợi ý: nhìn đồng hồ đầu giường hoặc gương phòng tắm.";
      els.keypadMsg.classList.add("err");
      keypadCode = "";
      setTimeout(renderKeypad, 420);
    }
  }

  function pushKeypadDigit(d) {
    if (d === "backspace") {
      if (keypadCode.length === 0) return;
      audio.playClockTick();
      keypadCode = keypadCode.slice(0, -1);
      renderKeypad();
      return;
    }
    if (!/^[0-9]$/.test(String(d)) || keypadCode.length >= 4) return;
    audio.playClockTick();
    keypadCode += String(d);
    renderKeypad();
    if (keypadCode.length === 4) {
      setTimeout(submitKeypad, 180);
    }
  }

  document
    .querySelectorAll("#keypad-screen .keypad-btn[data-digit]")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        pushKeypadDigit(btn.getAttribute("data-digit")),
      );
    });
  const btnClear = document.getElementById("btn-keypad-clear");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      keypadCode = "";
      renderKeypad();
      els.keypadMsg.textContent = "Gõ phím số hoặc bấm trực tiếp bên dưới.";
      els.keypadMsg.classList.remove("err");
    });
  }
  const btnEnter = document.getElementById("btn-keypad-enter");
  if (btnEnter) btnEnter.addEventListener("click", submitKeypad);
  const btnClose = document.getElementById("btn-close-keypad");
  if (btnClose) btnClose.addEventListener("click", closeKeypad);

  return {
    openKeypad,
    closeKeypad,
    submitKeypad,
    pushKeypadDigit,
    clearCode: () => {
      keypadCode = "";
      renderKeypad();
    },
  };
}
```

---

### <a id="src-ui-settingsMenu-js"></a> Tập tin: `src/ui/settingsMenu.js` (158 dòng)

```javascript
export function createSettingsController(els, settings, GFX_PRESETS, renderer, scene, lights, dustPoints, materials, saveSettingsFn, state, callbacks) {
  function applyGraphicsQuality(level) {
    const preset = GFX_PRESETS[level] || GFX_PRESETS.medium;
    const dpr = Math.min(window.devicePixelRatio || 1, preset.maxDpr);
    renderer.setPixelRatio(dpr);
    const container = els.container;
    renderer.setSize(Math.max(1, container.clientWidth || window.innerWidth || 1280), Math.max(1, container.clientHeight || window.innerHeight || 720), false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.toneMappingExposure = preset.exposure;

    document.body.classList.toggle('gfx-low', level === 'low');

    const shadowChanged = renderer.shadowMap.enabled !== preset.shadows || renderer.shadowMap.type !== preset.shadowType;
    renderer.shadowMap.enabled = preset.shadows;
    renderer.shadowMap.type = preset.shadowType;
    // Static shadow map caching: avoids re-rendering 6 shadow passes every single frame
    renderer.shadowMap.autoUpdate = false;

    // Never enable 6-pass PointLight shadow cubemap on handheld matchLight
    if (lights.matchLight) {
      lights.matchLight.castShadow = false;
    }

    if (lights.bedroomLampLight) {
      const lt = lights.bedroomLampLight;
      lt.castShadow = preset.shadows;
      if (lt.shadow) {
        if (lt.shadow.mapSize.width !== preset.shadowSize || shadowChanged) {
          lt.shadow.mapSize.width = preset.shadowSize;
          lt.shadow.mapSize.height = preset.shadowSize;
          if (lt.shadow.map) {
            lt.shadow.map.dispose();
            lt.shadow.map = null;
          }
        }
      }
    }

    materials.wallMat.bumpScale = preset.wallBump;
    materials.floorMat.bumpScale = preset.floorBump;
    if (shadowChanged) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => { m.needsUpdate = true; });
          else obj.material.needsUpdate = true;
        }
      });
    }

    if (dustPoints) dustPoints.visible = preset.dust;
    renderer.shadowMap.needsUpdate = true;
  }

  function applyAllSettings() {
    applyGraphicsQuality(settings.graphics);
    els.fpsBadge.classList.toggle('hidden', !settings.showFps);

    document.querySelectorAll('#gfx-preset-group .seg-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-gfx') === settings.graphics);
    });
    if (els.gfxDescEl) els.gfxDescEl.textContent = GFX_PRESETS[settings.graphics].desc;

    document.querySelectorAll('#fps-limit-group .seg-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-fps')) === settings.fpsLimit);
    });

    els.toggleShowFps.classList.toggle('on', settings.showFps);
    els.toggleCamSmooth.classList.toggle('on', settings.camSmooth);
    els.sliderSens.value = String(settings.sensitivity);
    els.sensDisplay.textContent = `${settings.sensitivity.toFixed(1)}x`;
  }

  document.querySelectorAll('#gfx-preset-group .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      settings.graphics = btn.getAttribute('data-gfx');
      saveSettingsFn(settings);
      applyAllSettings();
    });
  });

  document.querySelectorAll('#fps-limit-group .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      settings.fpsLimit = Number(btn.getAttribute('data-fps'));
      saveSettingsFn(settings);
      applyAllSettings();
    });
  });

  els.toggleShowFps.addEventListener('click', () => {
    settings.showFps = !settings.showFps;
    saveSettingsFn(settings);
    applyAllSettings();
  });

  els.toggleCamSmooth.addEventListener('click', () => {
    settings.camSmooth = !settings.camSmooth;
    if (!settings.camSmooth) {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
    }
    saveSettingsFn(settings);
    applyAllSettings();
  });

  els.sliderSens.addEventListener('input', () => {
    settings.sensitivity = parseFloat(els.sliderSens.value) || 1.0;
    els.sensDisplay.textContent = `${settings.sensitivity.toFixed(1)}x`;
    saveSettingsFn(settings);
  });

  const btnReset = document.getElementById('btn-reset-settings');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (callbacks.onReset) callbacks.onReset();
      applyAllSettings();
    });
  }

  function openSettings() {
    if (els.journalScreen && !els.journalScreen.classList.contains('hidden')) els.journalScreen.classList.add('hidden');
    if (state.running && !state.ended) {
      state.paused = true;
      if (document.pointerLockElement) document.exitPointerLock();
    }
    applyAllSettings();
    if (callbacks.clearKeys) callbacks.clearKeys();
    els.settingsScreen.classList.remove('hidden');
  }

  function closeSettings() {
    els.settingsScreen.classList.add('hidden');
    if (state.running && !state.ended && (!els.journalScreen || els.journalScreen.classList.contains('hidden'))) {
      state.paused = false;
    }
  }

  function toggleSettings() {
    if (els.settingsScreen.classList.contains('hidden')) openSettings();
    else closeSettings();
  }

  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) btnSettings.addEventListener('click', toggleSettings);
  const btnCloseSettings = document.getElementById('btn-close-settings');
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);

  applyAllSettings();

  return {
    applyAllSettings,
    applyGraphicsQuality,
    openSettings,
    closeSettings,
    toggleSettings
  };
}
```

---

### <a id="src-ui-subtitles-js"></a> Tập tin: `src/ui/subtitles.js` (128 dòng)

```javascript
export function createNarrator(voiceSelect, audio) {
  const narrator = {
    enabled: false,
    userPicked: false,
    voices: [],
    voice: null,
    loadVoice() {
      if (!('speechSynthesis' in window)) {
        if (voiceSelect) voiceSelect.style.display = 'none';
        return;
      }
      const all = window.speechSynthesis.getVoices() || [];
      const vi = all.filter(v => /vi/i.test(v.lang) || /viet|namminh|hoaimy/i.test(v.name));
      this.voices = vi.length > 0 ? vi : all.slice(0, 6);
      if (!voiceSelect) return;
      voiceSelect.innerHTML = '';
      if (this.voices.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'Mặc định';
        voiceSelect.appendChild(opt);
        return;
      }
      let defaultIdx = this.voices.findIndex(v => /nam\s*minh/i.test(v.name));
      if (defaultIdx < 0) defaultIdx = this.voices.findIndex(v => /hoai\s*my|google/i.test(v.name));
      if (defaultIdx < 0) defaultIdx = this.voices.findIndex(v => !/\ban\b/i.test(v.name));
      if (defaultIdx < 0) defaultIdx = 0;

      const currentName = this.userPicked && this.voice ? this.voice.name : null;
      let selectedIdx = currentName ? this.voices.findIndex(v => v.name === currentName) : defaultIdx;
      if (selectedIdx < 0) selectedIdx = defaultIdx;

      this.voices.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = v.name.replace(/Microsoft |Google |Online \(Natural\) - Vietnamese \(Vietnam\)/g, '').trim().slice(0, 20) || v.name.slice(0, 20);
        if (idx === selectedIdx) opt.selected = true;
        voiceSelect.appendChild(opt);
      });
      this.voice = this.voices[selectedIdx] || null;
    },
    speak(text, eerie = false) {
      if (!this.enabled || audio.muted || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        if (!this.voice) this.loadVoice();
        const clean = text.replace(/[“”]/g, '').replace(/\[F\]/g, 'phím F').replace(/\[E\]/g, 'phím E').replace(/\[Shift\]/g, 'phím Shift');
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = 'vi-VN';
        if (eerie === 'warm') {
          const fem = this.voices.find(v => /hoai\s*my|linh|nu|female|google/i.test(v.name));
          u.voice = fem || this.voice;
          u.rate = 0.92; u.pitch = 1.08; u.volume = 0.95;
        } else if (eerie === 'cold' || eerie === true) {
          if (this.voice) u.voice = this.voice;
          u.rate = 0.84; u.pitch = 0.76; u.volume = 0.95;
        } else {
          if (this.voice) u.voice = this.voice;
          u.rate = 0.98; u.pitch = 0.96; u.volume = 0.95;
        }
        window.speechSynthesis.speak(u);
      } catch (_) {}
    },
    stop() {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
    }
  };

  if (voiceSelect) {
    voiceSelect.addEventListener('change', () => {
      const idx = parseInt(voiceSelect.value, 10);
      if (!isNaN(idx) && narrator.voices[idx]) {
        narrator.userPicked = true;
        narrator.voice = narrator.voices[idx];
        if (narrator.enabled) narrator.speak('Thử giọng kể chuyện trong đêm mười bốn tháng mười một, lúc hai giờ mười bốn phút.');
      }
    });
  }

  if ('speechSynthesis' in window) {
    narrator.loadVoice();
    window.speechSynthesis.onvoiceschanged = () => narrator.loadVoice();
    setTimeout(() => narrator.loadVoice(), 600);
  }

  return narrator;
}

export function createSubtitleSystem(elsOrBox, narratorOrSpeaker, stateOrText, optNarrator, optAudio, optState) {
  let storySubtitleUntil = 0;

  const isObj = elsOrBox && elsOrBox.subtitleBox;
  const box = isObj ? elsOrBox.subtitleBox : elsOrBox;
  const speakerEl = isObj ? elsOrBox.subtitleSpeaker : narratorOrSpeaker;
  const textEl = isObj ? elsOrBox.subtitleText : stateOrText;
  const activeNarrator = isObj ? narratorOrSpeaker : optNarrator;
  const activeState = isObj ? stateOrText : optState;

  function showSubtitle(speaker, text, durationMs = 6600, eerieVoice = false, isMinor = false, warmVoice = false) {
    const now = performance.now();
    if (isMinor && now < storySubtitleUntil) return;
    if (speakerEl) speakerEl.textContent = speaker;
    if (textEl) textEl.textContent = text;
    if (box) {
      box.classList.toggle('warm-voice', warmVoice);
      box.classList.add('visible');
    }
    if (!isMinor && activeNarrator) {
      storySubtitleUntil = now + durationMs;
      activeNarrator.speak(text, eerieVoice);
    }
    if (box) {
      box.classList.toggle('voicemail-hold', durationMs === 0);
    }
    if (activeState && activeState.subtitleTimeout) clearTimeout(activeState.subtitleTimeout);
    if (durationMs > 0) {
      const timeoutId = setTimeout(() => {
        if (box) box.classList.remove('visible');
        storySubtitleUntil = 0;
      }, durationMs);
      if (activeState) activeState.subtitleTimeout = timeoutId;
    }
  }

  return { showSubtitle };
}
```

---

### <a id="src-world-doors-js"></a> Tập tin: `src/world/doors.js` (81 dòng)

```javascript
import * as THREE from 'three';
import { TOTAL_LOOPS } from '../config/storyData.js';

export function createDoorsSystem(scene, materials, colliders, interactables, getState) {
  const doors = [];

  function createDoor(id, x, z, rotY, isFrontDoor = false) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0, z);
    pivot.rotation.y = rotY;
    scene.add(pivot);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.5, 0.12), materials.doorMat);
    mesh.position.set(0.825, 1.25, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);

    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.15), materials.brassMat);
    plate.position.set(1.45, 1.12, 0);
    pivot.add(plate);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), materials.brassMat);
    knob.position.set(1.45, 1.12, 0.1);
    pivot.add(knob);

    const knob2 = knob.clone();
    knob2.position.z = -0.1;
    pivot.add(knob2);

    const isZAligned = Math.abs(rotY) > 0.5;
    const worldCenter = isZAligned
      ? new THREE.Vector3(x, 1.25, z - 0.825)
      : new THREE.Vector3(x + 0.825, 1.25, z);

    const collider = isZAligned
      ? { minX: x - 0.18, maxX: x + 0.18, minZ: z - 1.65, maxZ: z, active: true }
      : { minX: x, maxX: x + 1.65, minZ: z - 0.18, maxZ: z + 0.18, active: true };
    colliders.push(collider);

    const d = {
      type: 'door',
      id,
      pivot,
      baseRotY: rotY,
      worldPos: worldCenter,
      isFrontDoor,
      isOpen: false,
      targetOffset: 0,
      currentOffset: 0,
      angVel: 0,
      rattleTime: 0,
      collider,
      label: () => {
        const state = getState();
        if (d.isFrontDoor) {
          if (!state.loopClueFound) return 'Cửa chính (Chốt khóa — kiểm tra bàn làm việc)';
          return state.loop === TOTAL_LOOPS
            ? 'Nhấn [E] mở cửa chính chạy ra ngoài!'
            : 'Nhấn [E] mở cửa chính';
        }
        if (d.id === 'door_study' && state.loop === 1 && !state.studyKeyFound) {
          return 'Cửa phòng làm việc (Khóa — tìm chìa khóa trước)';
        }
        return d.isOpen ? 'Nhấn [E] đóng cửa' : 'Nhấn [E] mở cửa';
      }
    };
    doors.push(d);
    interactables.push(d);
    return d;
  }

  createDoor('door_bedroom', -0.825, -1.0, 0, false);
  createDoor('door_study', 3.5, -3.62, Math.PI / 2, false);
  createDoor('door_kitchen', -4.0, -1.35, Math.PI / 2, false);
  createDoor('door_bathroom', 3.5, 1.25, Math.PI / 2, false);
  createDoor('door_front', -0.825, -10.5, 0, true);

  return { doors, createDoor };
}
```

---

### <a id="src-world-entity-js"></a> Tập tin: `src/world/entity.js` (107 dòng)

```javascript
import * as THREE from 'three';

export function createShadowPresence(scene, materials) {
  const g = new THREE.Group();
  const coreShadowMat = materials.coreShadowMat || new THREE.MeshBasicMaterial({ color: 0x030305 });
  const mistMat = materials.mistMat || new THREE.MeshBasicMaterial({
    color: 0x05060a,
    transparent: true,
    opacity: 0.42,
    depthWrite: false
  });

  // Pure dark humanoid shadow silhouette (no ghost face, no claws)
  const lowerSilhouette = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 1.18, 16), coreShadowMat);
  lowerSilhouette.position.y = 0.59;
  g.add(lowerSilhouette);

  const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.62, 16), coreShadowMat);
  upperTorso.position.set(0, 1.46, 0.02);
  g.add(upperTorso);

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), coreShadowMat);
  shoulders.scale.set(1.18, 0.48, 0.68);
  shoulders.position.set(0, 1.72, 0.02);
  g.add(shoulders);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.16, 12), coreShadowMat);
  neck.position.set(0, 1.85, 0.03);
  g.add(neck);

  // Subtle shadow mist aura around body & floor
  const auraShell = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.48, 1.88, 16), mistMat);
  auraShell.position.y = 0.94;
  g.add(auraShell);

  const floorPool = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), mistMat);
  floorPool.rotation.x = -Math.PI / 2;
  floorPool.position.y = 0.02;
  g.add(floorPool);

  const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.44, 10);
  const foreArmGeo = new THREE.CylinderGeometry(0.044, 0.03, 0.46, 10);
  function makeShadowArm(side) {
    const ag = new THREE.Group();
    ag.position.set(side * 0.28, 1.7, 0.02);
    const upper = new THREE.Mesh(upperArmGeo, coreShadowMat);
    upper.position.set(0, -0.22, 0.02);
    ag.add(upper);
    const fore = new THREE.Mesh(foreArmGeo, coreShadowMat);
    fore.position.set(0, -0.64, 0.06);
    fore.rotation.x = -0.15;
    ag.add(fore);
    return ag;
  }
  const armL = makeShadowArm(-1), armR = makeShadowArm(1);
  g.add(armL, armR);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.04, 0.04);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 16), coreShadowMat);
  head.scale.set(0.88, 1.12, 0.92);
  headGroup.add(head);
  const eyeMat = materials.eyeMat || new THREE.MeshBasicMaterial({ color: 0xf4f7ff });
  const eyeGeo = new THREE.SphereGeometry(0.016, 10, 10);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.scale.set(1.15, 0.72, 0.6);
  eyeL.position.set(-0.046, 0.022, 0.122);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.scale.set(1.15, 0.72, 0.6);
  eyeR.position.set(0.046, 0.022, 0.122);
  headGroup.add(eyeL, eyeR);
  g.add(headGroup);

  // Subtle cold backlight sprite proxy (replaces PointLight to stay within WebGL light budget)
  const strobeColor = new THREE.Color(0x46586e);
  const strobeMat = new THREE.SpriteMaterial({
    map: materials.glintTex || null,
    color: strobeColor,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const strobeSprite = new THREE.Sprite(strobeMat);
  strobeSprite.position.set(0, 1.65, -0.35);
  strobeSprite.scale.set(1.6, 2.4, 1);
  g.add(strobeSprite);

  let _strobeIntensity = 0.25;
  const strobe = {
    color: strobeColor,
    sprite: strobeSprite,
    get intensity() {
      return _strobeIntensity;
    },
    set intensity(v) {
      _strobeIntensity = Number.isFinite(v) ? Math.max(0, v) : 0;
      strobeSprite.visible = _strobeIntensity > 0.01;
      strobeMat.opacity = Math.min(0.55, _strobeIntensity * 0.95);
    }
  };

  g.visible = false;
  scene.add(g);
  return { group: g, headGroup, strobe, armL, armR };
}
```

---

### <a id="src-world-house-js"></a> Tập tin: `src/world/house.js` (1,099 dòng)

```javascript
import * as THREE from 'three';
import { createWindowRainSystem, makeTileFloorTex, makeRugTexture } from './textures.js';

export function createHouse(scene, materials, colliders, interactables, getState) {
  // Shared BoxGeometry cache to avoid duplicate GPU buffer allocations
  const boxGeoCache = new Map();
  function getBoxGeo(w, h, d) {
    const key = `${w}_${h}_${d}`;
    let geo = boxGeoCache.get(key);
    if (!geo) {
      geo = new THREE.BoxGeometry(w, h, d);
      boxGeoCache.set(key, geo);
    }
    return geo;
  }

  function addBox(w, h, d, x, y, z, mat, solid = true, cast = true, receive = true) {
    const mesh = new THREE.Mesh(getBoxGeo(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    if (solid) {
      colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, active: true });
    }
    return mesh;
  }

  // Lightweight additive sprite proxy replacing micro PointLights (zero shader light cost)
  function createGlowProxy(parent, hexColor, pos, baseScale, initialIntensity = 0, maxOpacity = 0.72) {
    const color = new THREE.Color(hexColor);
    const mat = new THREE.SpriteMaterial({
      map: materials.glintTex || null,
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(pos[0], pos[1], pos[2]);
    parent.add(sprite);

    let _intensity = 0;
    const sync = () => {
      const clamped = Math.max(0, _intensity);
      sprite.visible = clamped > 0.01;
      mat.opacity = Math.min(maxOpacity, clamped * 0.45);
      const s = baseScale * (0.75 + Math.min(1.6, clamped * 0.45));
      sprite.scale.set(s, s, 1);
    };

    const proxy = {
      isGlowProxy: true,
      sprite,
      color,
      position: sprite.position,
      get intensity() {
        return _intensity;
      },
      set intensity(v) {
        _intensity = Number.isFinite(v) ? v : 0;
        sync();
      },
      get visible() {
        return sprite.visible;
      },
      set visible(v) {
        sprite.visible = Boolean(v);
      }
    };
    proxy.intensity = initialIntensity;
    return proxy;
  }

  // Ceilings and floors
  addBox(17.6, 0.25, 17, -0.1, -0.125, -3.0, materials.floorMat, false, false, true);
  addBox(17.6, 0.25, 17, -0.1, 3.25, -3.0, materials.ceilingMat, false, false, true);

  // Instanced ceiling beams (6 beams -> 1 draw call)
  {
    const beamZs = [];
    for (let z = 3.2; z >= -9.8; z -= 2.6) beamZs.push(z);
    const beamInst = new THREE.InstancedMesh(getBoxGeo(17.2, 0.16, 0.18), materials.woodDarkMat, beamZs.length);
    beamInst.receiveShadow = true;
    const dummy = new THREE.Object3D();
    beamZs.forEach((z, i) => {
      dummy.position.set(-0.1, 3.08, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      beamInst.setMatrixAt(i, dummy.matrix);
    });
    beamInst.instanceMatrix.needsUpdate = true;
    scene.add(beamInst);
  }

  // Rain on window system
  const { rainWinTex, updateWindowRain } = createWindowRainSystem();
  const slatGeo = getBoxGeo(1.34, 0.035, 0.04);
  const windowGlassMat = new THREE.MeshBasicMaterial({ map: rainWinTex });

  let livingWindowMoon = null;
  function addMoonlitWindow(x, y, z, rotY, isLiving = false) {
    const wg = new THREE.Group();
    wg.position.set(x, y, z);
    wg.rotation.y = rotY;
    wg.add(new THREE.Mesh(getBoxGeo(1.5, 1.5, 0.12), materials.woodDarkMat));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 1.32), windowGlassMat);
    glass.position.z = 0.065;
    wg.add(glass);

    // Instanced blinds/slats per window (9 slats -> 1 draw call)
    const slatYs = [];
    for (let sy = -0.58; sy <= 0.58; sy += 0.14) slatYs.push(sy);
    const slatInst = new THREE.InstancedMesh(slatGeo, materials.woodDarkMat, slatYs.length);
    const dummy = new THREE.Object3D();
    slatYs.forEach((sy, i) => {
      dummy.position.set(0, sy, 0.08);
      dummy.rotation.set(0.35, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      slatInst.setMatrixAt(i, dummy.matrix);
    });
    slatInst.instanceMatrix.needsUpdate = true;
    wg.add(slatInst);
    scene.add(wg);

    // Only keep 1 real SpotLight (living room window) to stay within WebGL light budget
    if (isLiving) {
      const moon = new THREE.SpotLight(0x638cb8, 1.15, 9.5, Math.PI / 3.2, 0.65, 1.5);
      moon.position.set(x + 0.25, y + 0.1, z);
      moon.target.position.set(x + 3.5, 0.1, z);
      scene.add(moon, moon.target);
      livingWindowMoon = moon;
    } else {
      createGlowProxy(wg, 0x638cb8, [0, 0, 0.22], 1.65, 0.75, 0.28);
    }
  }
  addMoonlitWindow(-3.32, 1.85, 1.6, Math.PI / 2, false);
  addMoonlitWindow(-3.82, 1.85, -6.0, Math.PI / 2, true);

  // ==========================================
  // 1. BEDROOM
  // ==========================================
  addBox(7.2, 3.3, 0.3, 0, 1.65, 4.5, materials.wallMat);
  addBox(0.3, 3.3, 5.7, -3.5, 1.65, 1.75, materials.wallMat);
  // East wall split for bathroom doorway
  addBox(0.3, 3.3, 0.65, 3.5, 1.65, -0.72, materials.wallMat);
  addBox(0.3, 3.3, 3.35, 3.5, 1.65, 2.92, materials.wallMat);
  addBox(0.3, 0.75, 1.8, 3.5, 2.9, 0.425, materials.wallMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, -0.4, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, 1.25, materials.woodDarkMat, false);
  addBox(0.36, 0.12, 1.88, 3.5, 2.56, 0.425, materials.woodDarkMat, false);
  // North bedroom wall
  addBox(2.75, 3.3, 0.3, -2.2, 1.65, -1.0, materials.wallMat);
  addBox(2.75, 3.3, 0.3, 2.2, 1.65, -1.0, materials.wallMat);
  addBox(1.8, 0.75, 0.3, 0, 2.9, -1.0, materials.wallMat, false);
  addBox(0.12, 2.58, 0.36, -0.88, 1.29, -1.0, materials.woodDarkMat, false);
  addBox(0.12, 2.58, 0.36, 0.88, 1.29, -1.0, materials.woodDarkMat, false);
  addBox(1.88, 0.12, 0.36, 0, 2.56, -1.0, materials.woodDarkMat, false);

  // Bed & Bed Rug
  const bedRug = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.0),
    new THREE.MeshStandardMaterial({ map: makeRugTexture('#382022', '#73533a'), roughness: 0.96 })
  );
  bedRug.rotation.x = -Math.PI / 2;
  bedRug.position.set(0.3, 0.012, 2.2);
  bedRug.receiveShadow = true;
  scene.add(bedRug);

  addBox(2.1, 0.36, 2.4, -1.7, 0.22, 3.0, materials.woodRichMat);
  [[-2.7, 1.84], [-0.7, 1.84], [-2.7, 4.16], [-0.7, 4.16]].forEach(([px, pz]) => {
    addBox(0.11, pz > 3 ? 1.25 : 0.65, 0.11, px, pz > 3 ? 0.625 : 0.325, pz, materials.woodRichMat, false);
  });
  addBox(2.05, 0.12, 0.08, -1.7, 1.15, 4.16, materials.woodRichMat, false);

  // Instanced headboard slats (7 slats -> 1 draw call)
  {
    const slatXs = [];
    for (let sx = -2.45; sx <= -0.95; sx += 0.25) slatXs.push(sx);
    const headSlats = new THREE.InstancedMesh(getBoxGeo(0.07, 0.68, 0.05), materials.woodRichMat, slatXs.length);
    headSlats.castShadow = true;
    headSlats.receiveShadow = true;
    const dummy = new THREE.Object3D();
    slatXs.forEach((sx, i) => {
      dummy.position.set(sx, 0.78, 4.16);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      headSlats.setMatrixAt(i, dummy.matrix);
    });
    headSlats.instanceMatrix.needsUpdate = true;
    scene.add(headSlats);
  }

  addBox(1.94, 0.22, 2.26, -1.7, 0.49, 3.0, materials.pillowMat, false);
  addBox(1.98, 0.24, 1.62, -1.7, 0.52, 2.66, materials.blanketMat, false);
  addBox(0.76, 0.15, 0.42, -2.14, 0.66, 3.78, materials.pillowMat, false);
  const secondPillowMesh = addBox(0.76, 0.15, 0.42, -1.26, 0.66, 3.78, materials.pillowMat, false);

  // Nightstand & Digital LED Clock
  addBox(0.68, 0.64, 0.58, -0.2, 0.32, 3.9, materials.woodRichMat);
  addBox(0.56, 0.22, 0.04, -0.2, 0.46, 3.6, materials.woodDarkMat, false);
  addBox(0.56, 0.22, 0.04, -0.2, 0.18, 3.6, materials.woodDarkMat, false);
  addBox(0.14, 0.025, 0.04, -0.2, 0.46, 3.57, materials.brassMat, false);
  addBox(0.14, 0.025, 0.04, -0.2, 0.18, 3.57, materials.brassMat, false);

  const clockCanvas = document.createElement('canvas'); clockCanvas.width = 256; clockCanvas.height = 128;
  const clockCtx = clockCanvas.getContext('2d');
  const clockTex = new THREE.CanvasTexture(clockCanvas);
  function drawClockFace(text, color = '#ff4a3d') {
    clockCtx.fillStyle = '#070709'; clockCtx.fillRect(0, 0, 256, 128);
    clockCtx.shadowColor = color; clockCtx.shadowBlur = 14;
    clockCtx.fillStyle = color; clockCtx.font = 'bold 76px monospace';
    clockCtx.textAlign = 'center'; clockCtx.textBaseline = 'middle';
    clockCtx.fillText(text, 128, 66);
    clockTex.needsUpdate = true;
  }
  drawClockFace('02:14');

  const clockMesh = new THREE.Mesh(
    getBoxGeo(0.28, 0.14, 0.12),
    [materials.metalMat, materials.metalMat, materials.metalMat, materials.metalMat, new THREE.MeshBasicMaterial({ map: clockTex }), materials.metalMat]
  );
  clockMesh.position.set(-0.2, 0.71, 3.85);
  clockMesh.rotation.y = -0.35;
  scene.add(clockMesh);

  // Emissive glow proxy instead of PointLight
  const clockGlow = createGlowProxy(scene, 0xff3322, [-0.2, 0.74, 3.72], 0.42, 0.5, 0.42);

  const clockAnomalyObj = {
    type: 'clock_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-0.2, 0.75, 3.85),
    label: () => clockAnomalyObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra đồng hồ đầu giường bất thường'
  };
  interactables.push(clockAnomalyObj);

  // Bedroom Dresser & Table Lamp
  addBox(1.1, 0.82, 0.6, 1.35, 0.41, 4.05, materials.woodRichMat);
  addBox(0.14, 0.34, 0.14, 1.35, 0.99, 4.05, materials.brassMat, false);
  const lampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.25, 0.26, 14),
    new THREE.MeshStandardMaterial({ color: 0xebd1a7, emissive: 0xd98f3a, emissiveIntensity: 0.55, roughness: 0.8 })
  );
  lampShade.position.set(1.35, 1.24, 4.05);
  scene.add(lampShade);

  const bedroomLampLight = new THREE.PointLight(0xffa952, 1.45, 7.2, 1.75);
  bedroomLampLight.position.set(1.35, 1.28, 3.95);
  bedroomLampLight.castShadow = true;
  bedroomLampLight.shadow.mapSize.width = 512;
  bedroomLampLight.shadow.mapSize.height = 512;
  bedroomLampLight.shadow.bias = -0.002;
  scene.add(bedroomLampLight);

  // Creepy Interactive Wardrobe
  addBox(0.68, 2.25, 1.45, 3.0, 1.125, 2.95, materials.woodRichMat);
  const wardrobeDoorPivot = new THREE.Group();
  wardrobeDoorPivot.position.set(2.65, 0, 2.27);
  scene.add(wardrobeDoorPivot);
  const wDoorMesh = new THREE.Mesh(getBoxGeo(0.05, 2.08, 0.68), materials.woodDarkMat);
  wDoorMesh.position.set(0, 1.12, 0.34);
  wDoorMesh.castShadow = true;
  wardrobeDoorPivot.add(wDoorMesh);
  const wHandle = new THREE.Mesh(getBoxGeo(0.06, 0.14, 0.03), materials.brassMat);
  wHandle.position.set(-0.04, 1.12, 0.62);
  wardrobeDoorPivot.add(wHandle);

  const wardrobeDoorPivot2 = new THREE.Group();
  wardrobeDoorPivot2.position.set(2.65, 0, 3.63);
  scene.add(wardrobeDoorPivot2);
  const wDoorMesh2 = new THREE.Mesh(getBoxGeo(0.05, 2.08, 0.68), materials.woodDarkMat);
  wDoorMesh2.position.set(0, 1.12, -0.34);
  wDoorMesh2.castShadow = true;
  wardrobeDoorPivot2.add(wDoorMesh2);

  const wardrobeEyes = new THREE.Group();
  const eyeGeo = new THREE.SphereGeometry(0.015, 6, 6);
  const weL = new THREE.Mesh(eyeGeo, materials.weMat);
  weL.position.set(2.74, 1.56, 2.80);
  const weR = new THREE.Mesh(eyeGeo, materials.weMat);
  weR.position.set(2.74, 1.56, 2.93);
  wardrobeEyes.add(weL, weR);
  wardrobeEyes.visible = false;
  scene.add(wardrobeEyes);

  const wardrobeObj = {
    type: 'wardrobe',
    worldPos: new THREE.Vector3(2.6, 1.3, 2.95),
    checkedInLoop: 0,
    targetAngle: 0,
    label: () => wardrobeObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] mở tủ quần áo'
  };
  interactables.push(wardrobeObj);

  // Bedroom Mirror
  addBox(0.08, 1.38, 0.88, -3.32, 1.72, 3.2, materials.woodRichMat, false);
  const mirrorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.24), materials.mirrorMat);
  mirrorMesh.position.set(-3.27, 1.72, 3.2);
  mirrorMesh.rotation.y = Math.PI / 2;
  scene.add(mirrorMesh);
  const mirrorObj = {
    type: 'mirror',
    worldPos: new THREE.Vector3(-3.2, 1.65, 3.2),
    checkedInLoop: 0,
    label: () => mirrorObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] nhìn vào gương'
  };
  interactables.push(mirrorObj);

  // ==========================================
  // 2. LIVING ROOM
  // ==========================================
  addBox(0.3, 3.3, 7.65, -4.0, 1.65, -6.82, materials.wallMat);
  addBox(0.3, 3.3, 0.55, -4.0, 1.65, -1.07, materials.wallMat);
  addBox(0.3, 0.75, 1.8, -4.0, 2.9, -2.175, materials.wallMat, false);
  addBox(0.36, 2.58, 0.12, -4.0, 1.29, -3.0, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, -4.0, 1.29, -1.35, materials.woodDarkMat, false);
  addBox(0.36, 0.12, 1.88, -4.0, 2.56, -2.175, materials.woodDarkMat, false);
  addBox(0.3, 3.3, 2.6, 3.5, 1.65, -2.3, materials.wallMat);
  addBox(0.3, 3.3, 5.2, 3.5, 1.65, -7.9, materials.wallMat);
  addBox(0.3, 0.75, 1.8, 3.5, 2.9, -4.45, materials.wallMat, false);
  addBox(3.3, 3.3, 0.3, -2.45, 1.65, -10.5, materials.wallMat);
  addBox(2.8, 3.3, 0.3, 2.2, 1.65, -10.5, materials.wallMat);
  addBox(1.8, 0.75, 0.3, 0, 2.9, -10.5, materials.wallMat, false);
  addBox(0.12, 2.58, 0.36, -0.88, 1.29, -10.5, materials.woodDarkMat, false);
  addBox(0.12, 2.58, 0.36, 0.88, 1.29, -10.5, materials.woodDarkMat, false);
  addBox(1.88, 0.12, 0.36, 0, 2.56, -10.5, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, -3.56, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, -5.32, materials.woodDarkMat, false);
  addBox(0.36, 0.12, 1.88, 3.5, 2.56, -4.44, materials.woodDarkMat, false);

  const livRug = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 4.4),
    new THREE.MeshStandardMaterial({ map: makeRugTexture('#242b2d', '#6e5a44'), roughness: 0.96 })
  );
  livRug.rotation.x = -Math.PI / 2;
  livRug.position.set(-0.3, 0.012, -5.8);
  livRug.receiveShadow = true;
  scene.add(livRug);

  // Sofa
  addBox(0.85, 0.38, 2.2, 2.8, 0.24, -7.8, materials.sofaMat);
  addBox(0.24, 0.78, 2.2, 3.12, 0.58, -7.8, materials.sofaMat, false);
  addBox(0.85, 0.56, 0.2, 2.8, 0.38, -6.75, materials.sofaMat, false);
  addBox(0.85, 0.56, 0.2, 2.8, 0.38, -8.85, materials.sofaMat, false);
  addBox(0.24, 0.26, 0.32, 2.88, 0.56, -7.2, materials.pillowMat, false);
  addBox(0.24, 0.26, 0.32, 2.88, 0.56, -8.4, materials.blanketMat, false);

  // Dining Table + Rotary Phone
  addBox(1.55, 0.08, 1.05, -2.3, 0.76, -5.8, materials.woodRichMat);
  [[-3.0, -6.24], [-1.6, -6.24], [-3.0, -5.36], [-1.6, -5.36]].forEach(([lx, lz]) => {
    addBox(0.08, 0.74, 0.08, lx, 0.37, lz, materials.woodDarkMat, false);
  });

  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(-1.95, 0.84, -5.5);
  const pBase = new THREE.Mesh(getBoxGeo(0.22, 0.09, 0.2), materials.metalMat);
  const pHandset = new THREE.Mesh(getBoxGeo(0.28, 0.05, 0.06), materials.metalMat);
  pHandset.position.set(0, 0.07, 0);
  phoneGroup.add(pBase, pHandset);
  scene.add(phoneGroup);
  // Glow sprite proxy instead of PointLight
  const phoneLed = createGlowProxy(scene, 0xff4433, [-1.95, 0.96, -5.5], 0.36, 0, 0.85);

  const phoneObj = {
    type: 'phone',
    ringing: false,
    answered: false,
    worldPos: new THREE.Vector3(-1.95, 0.9, -5.5),
    label: () => phoneObj.ringing ? 'Nhấn [E] nhấc máy nghe điện thoại' : ''
  };
  interactables.push(phoneObj);

  // Anomalous Chair
  const chairGroup = new THREE.Group();
  const cSeat = new THREE.Mesh(getBoxGeo(0.48, 0.07, 0.48), materials.woodRichMat);
  cSeat.position.y = 0.46; cSeat.castShadow = true;
  const cBack = new THREE.Mesh(getBoxGeo(0.48, 0.54, 0.06), materials.woodRichMat);
  cBack.position.set(0, 0.74, -0.21); cBack.castShadow = true;
  const chairLegGeo = getBoxGeo(0.05, 0.46, 0.05);
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(chairLegGeo, materials.woodDarkMat);
    leg.position.set(lx, 0.23, lz); leg.castShadow = true;
    chairGroup.add(leg);
  });
  chairGroup.add(cSeat, cBack);
  chairGroup.position.set(-1.3, 0, -5.8);
  chairGroup.rotation.y = -Math.PI / 2;
  scene.add(chairGroup);

  const chairAnomalyObj = {
    type: 'chair_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-1.3, 0.65, -5.8),
    label: () => chairAnomalyObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra chiếc ghế bị dịch chuyển'
  };
  interactables.push(chairAnomalyObj);

  // CRT TV
  addBox(1.3, 0.65, 0.55, -3.45, 0.32, -8.3, materials.woodRichMat);
  const tvMesh = addBox(0.76, 0.58, 0.52, -3.45, 0.94, -8.3, materials.metalMat, false);
  const ant1 = addBox(0.02, 0.42, 0.02, -3.45, 1.38, -8.2, materials.metalMat, false); ant1.rotation.x = 0.4;
  const ant2 = addBox(0.02, 0.42, 0.02, -3.45, 1.38, -8.4, materials.metalMat, false); ant2.rotation.x = -0.4;
  const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), materials.tvScreenMat);
  tvScreen.position.set(-3.18, 0.94, -8.3);
  tvScreen.rotation.y = Math.PI / 2;
  scene.add(tvScreen);

  const tvLight = new THREE.PointLight(0xa5c4e8, 0, 6.5, 2.0);
  tvLight.position.set(-2.8, 0.94, -8.3);
  scene.add(tvLight);

  const tvObj = {
    type: 'tv',
    worldPos: new THREE.Vector3(-3.2, 0.94, -8.3),
    checkedInLoop: 0,
    label: () => (getState().loop >= 2 && tvObj.checkedInLoop !== getState().loop)
      ? 'Nhấn [E] kiểm tra màn hình TV nhiễu hạt'
      : ''
  };
  interactables.push(tvObj);

  // Family Portrait
  const portraitGroup = new THREE.Group();
  portraitGroup.position.set(-3.82, 1.82, -3.4);
  const pFrameMesh = new THREE.Mesh(getBoxGeo(0.08, 1.06, 0.88), materials.woodRichMat);
  const portraitMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.94), materials.portraitMat);
  portraitMesh.position.set(0.05, 0, 0);
  portraitMesh.rotation.y = Math.PI / 2;
  portraitGroup.add(pFrameMesh, portraitMesh);
  scene.add(portraitGroup);

  const portraitAnomalyObj = {
    type: 'portrait_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-3.75, 1.75, -3.4),
    label: () => portraitAnomalyObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra khung ảnh bất thường'
  };
  interactables.push(portraitAnomalyObj);

  // Bookshelves (all ~80 books merged into 1 THREE.InstancedMesh -> 1 draw call!)
  const bookColors = [0x54231b, 0x1f3629, 0x242838, 0x594627, 0x3d2938];
  const bookInstances = [];
  const shelfFrameGeo = getBoxGeo(1.4, 2.1, 0.36);
  const shelfBoardGeo = getBoxGeo(1.32, 0.04, 0.38);

  function addBookshelf(x, z, rotY) {
    const bg = new THREE.Group();
    bg.position.set(x, 0, z);
    bg.rotation.y = rotY;
    const frame = new THREE.Mesh(shelfFrameGeo, materials.woodRichMat);
    frame.position.y = 1.05; frame.castShadow = true; frame.receiveShadow = true;
    bg.add(frame);

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    for (let sy = 0.42; sy <= 1.7; sy += 0.42) {
      const shelf = new THREE.Mesh(shelfBoardGeo, materials.woodDarkMat);
      shelf.position.set(0, sy, 0.02);
      bg.add(shelf);
      for (let bx = -0.58; bx <= 0.58; bx += 0.12) {
        if (Math.random() > 0.18) {
          const bh = 0.28 + Math.random() * 0.08;
          const lz = 0.02;
          const wx = x + bx * cosY + lz * sinY;
          const wz = z - bx * sinY + lz * cosY;
          bookInstances.push({
            x: wx,
            y: sy + bh / 2,
            z: wz,
            rotY,
            rotZ: (Math.random() - 0.5) * 0.12,
            height: bh,
            colorHex: bookColors[Math.floor(Math.random() * bookColors.length)]
          });
        }
      }
    }
    scene.add(bg);
    colliders.push({ minX: x - 0.72, maxX: x + 0.72, minZ: z - 0.24, maxZ: z + 0.24, active: true });
  }
  addBookshelf(-2.5, -10.1, 0);
  addBookshelf(5.8, -2.88, 0);

  if (bookInstances.length > 0) {
    const bookGeo = new THREE.BoxGeometry(0.08, 1.0, 0.24);
    const bookMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const booksInstanced = new THREE.InstancedMesh(bookGeo, bookMat, bookInstances.length);
    booksInstanced.castShadow = false;
    booksInstanced.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();
    bookInstances.forEach((b, idx) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.rotY, b.rotZ);
      dummy.scale.set(1, b.height, 1);
      dummy.updateMatrix();
      booksInstanced.setMatrixAt(idx, dummy.matrix);
      tmpColor.setHex(b.colorHex);
      booksInstanced.setColorAt(idx, tmpColor);
    });
    booksInstanced.instanceMatrix.needsUpdate = true;
    if (booksInstanced.instanceColor) booksInstanced.instanceColor.needsUpdate = true;
    scene.add(booksInstanced);
  }

  // Wall Scrawl
  const wallScrawl = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.05), materials.wallScrawlMat);
  wallScrawl.position.set(1.9, 1.65, -0.82);
  wallScrawl.visible = false;
  scene.add(wallScrawl);

  const scrawlAnomalyObj = {
    type: 'scrawl_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(1.9, 1.65, -0.85),
    label: () => (!wallScrawl.visible || scrawlAnomalyObj.checkedInLoop === getState().loop)
      ? ''
      : 'Nhấn [E] kiểm tra dòng chữ viết trên tường'
  };
  interactables.push(scrawlAnomalyObj);

  // ==========================================
  // 3. STUDY ROOM
  // ==========================================
  addBox(4.9, 3.3, 0.3, 5.85, 1.65, -2.5, materials.wallMat);
  addBox(4.9, 3.3, 0.3, 5.85, 1.65, -7.5, materials.wallMat);
  addBox(0.3, 3.3, 5.3, 8.2, 1.65, -5.0, materials.wallMat);
  addBox(1.2, 0.08, 1.9, 7.2, 0.78, -5.0, materials.woodRichMat);
  addBox(0.45, 0.74, 0.55, 7.2, 0.37, -4.3, materials.woodDarkMat, false);
  addBox(0.45, 0.74, 0.55, 7.2, 0.37, -5.7, materials.woodDarkMat, false);
  for (let i = 0; i < 4; i++) {
    const pap = addBox(0.24, 0.008, 0.3, 7.1 + (Math.random() - 0.5) * 0.4, 0.83, -5.3 + i * 0.28, materials.pillowMat, false, false, true);
    pap.rotation.y = (Math.random() - 0.5) * 0.6;
  }
  addBox(0.14, 0.28, 0.14, 7.45, 0.96, -4.35, materials.brassMat, false);
  const bankerShade = new THREE.Mesh(
    getBoxGeo(0.18, 0.1, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1e6b47, emissive: 0x165938, emissiveIntensity: 0.6, roughness: 0.35 })
  );
  bankerShade.position.set(7.42, 1.12, -4.35);
  scene.add(bankerShade);
  const studyLampLight = new THREE.PointLight(0x88d4a6, 0.75, 5.0, 1.8);
  studyLampLight.position.set(7.2, 1.05, -4.45);
  scene.add(studyLampLight);

  // ==========================================
  // 4. KITCHEN
  // ==========================================
  addBox(4.6, 3.3, 0.3, -6.2, 1.65, -4.8, materials.wallMat);
  addBox(5.1, 3.3, 0.3, -5.95, 1.65, -1.0, materials.wallMat);
  addBox(0.3, 3.3, 4.1, -8.4, 1.65, -2.9, materials.wallMat);

  const kitchenTileFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.3, 3.65),
    new THREE.MeshStandardMaterial({ map: makeTileFloorTex('#1f2226', '#14161a'), roughness: 0.42, metalness: 0.08 })
  );
  kitchenTileFloor.rotation.x = -Math.PI / 2;
  kitchenTileFloor.position.set(-6.2, 0.012, -2.9);
  kitchenTileFloor.receiveShadow = true;
  scene.add(kitchenTileFloor);

  // Kitchen counter + sink
  addBox(3.2, 0.82, 0.68, -6.4, 0.41, -4.3, materials.woodDarkMat);
  addBox(3.26, 0.06, 0.72, -6.4, 0.85, -4.3, materials.counterTopMat, false);
  addBox(0.68, 0.04, 0.46, -6.7, 0.87, -4.28, materials.metalMat, false);
  addBox(0.04, 0.26, 0.04, -6.7, 1.0, -4.52, materials.chromeMat, false);
  addBox(0.04, 0.04, 0.18, -6.7, 1.12, -4.44, materials.chromeMat, false);
  const kitchenWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.26, 8), materials.waterStreamMat);
  kitchenWaterMesh.position.set(-6.7, 0.99, -4.36);
  kitchenWaterMesh.visible = false;
  scene.add(kitchenWaterMesh);

  const kitchenFaucetObj = {
    type: 'kitchen_faucet',
    running: false,
    dripping: true,
    worldPos: new THREE.Vector3(-6.7, 1.02, -4.35),
    label: () => kitchenFaucetObj.running
      ? 'Nhấn [E] khóa vòi nước bếp đang chảy'
      : (kitchenFaucetObj.dripping ? 'Nhấn [E] vặn chặt vòi nước bếp' : '')
  };
  interactables.push(kitchenFaucetObj);

  const mug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 10), materials.porcelainMat);
  mug1.position.set(-6.15, 0.93, -4.25); scene.add(mug1);
  const mug2 = mug1.clone(); mug2.position.set(-6.02, 0.93, -4.34); scene.add(mug2);

  const kitchenNoteMesh = new THREE.Mesh(
    getBoxGeo(0.2, 0.012, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xe8d9a8, emissive: 0x8f7438, emissiveIntensity: 0.35, roughness: 0.7 })
  );
  kitchenNoteMesh.position.set(-5.35, 0.89, -4.22);
  kitchenNoteMesh.rotation.y = 0.22;
  scene.add(kitchenNoteMesh);

  const kitchenNoteObj = {
    type: 'kitchen_note',
    readInLoop: 0,
    worldPos: new THREE.Vector3(-5.35, 0.92, -4.22),
    label: () => kitchenNoteObj.readInLoop === getState().loop ? '' : 'Nhấn [E] đọc tờ ghi chú trên quầy bếp'
  };
  interactables.push(kitchenNoteObj);

  // Ajar Refrigerator
  addBox(0.76, 1.92, 0.82, -7.88, 0.96, -2.2, materials.fridgeBodyMat);
  const fridgeInterior = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 1.72),
    new THREE.MeshBasicMaterial({ color: 0xdff6ff })
  );
  fridgeInterior.position.set(-7.49, 0.96, -2.2);
  fridgeInterior.rotation.y = Math.PI / 2;
  scene.add(fridgeInterior);

  const fridgeDoorPivot = new THREE.Group();
  fridgeDoorPivot.position.set(-7.48, 0, -1.8);
  scene.add(fridgeDoorPivot);
  const fridgeDoorMesh = new THREE.Mesh(getBoxGeo(0.06, 1.88, 0.8), materials.fridgeBodyMat);
  fridgeDoorMesh.position.set(0, 0.96, -0.4);
  fridgeDoorMesh.castShadow = true;
  fridgeDoorPivot.add(fridgeDoorMesh);
  const fridgeHandle = new THREE.Mesh(getBoxGeo(0.06, 0.32, 0.04), materials.chromeMat);
  fridgeHandle.position.set(0.05, 1.15, -0.72);
  fridgeDoorPivot.add(fridgeHandle);

  const fridgeLight = new THREE.PointLight(0xb8ecff, 1.05, 5.2, 1.8);
  fridgeLight.position.set(-7.22, 1.15, -2.2);
  scene.add(fridgeLight);

  const fridgeObj = {
    type: 'fridge',
    checkedInLoop: 0,
    targetAngle: 0.28,
    worldPos: new THREE.Vector3(-7.45, 1.15, -2.2),
    label: () => fridgeObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra tủ lạnh hở sáng'
  };
  interactables.push(fridgeObj);

  // ==========================================
  // 5. BATHROOM
  // ==========================================
  addBox(4.0, 3.3, 0.3, 5.45, 1.65, -1.0, materials.wallMat);
  addBox(4.0, 3.3, 0.3, 5.45, 1.65, 3.2, materials.wallMat);
  addBox(0.3, 3.3, 4.5, 7.4, 1.65, 1.1, materials.wallMat);

  const bathTileFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 4.05),
    new THREE.MeshStandardMaterial({ map: makeTileFloorTex('#262d34', '#1b2026'), roughness: 0.36, metalness: 0.1 })
  );
  bathTileFloor.rotation.x = -Math.PI / 2;
  bathTileFloor.position.set(5.45, 0.012, 1.1);
  bathTileFloor.receiveShadow = true;
  scene.add(bathTileFloor);

  const bathTubeMesh = new THREE.Mesh(
    getBoxGeo(0.9, 0.05, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xcbe8e2 })
  );
  bathTubeMesh.position.set(5.45, 3.08, 1.1);
  scene.add(bathTubeMesh);

  const bathLight = new THREE.PointLight(0xaad9d0, 0.95, 6.2, 1.7);
  bathLight.position.set(5.45, 2.85, 1.1);
  scene.add(bathLight);

  addBox(2.05, 0.56, 0.85, 5.45, 0.28, -0.4, materials.porcelainMat);
  const bathWaterSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(1.85, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x162228, roughness: 0.12, metalness: 0.55 })
  );
  bathWaterSurface.rotation.x = -Math.PI / 2;
  bathWaterSurface.position.set(5.45, 0.57, -0.4);
  scene.add(bathWaterSurface);

  addBox(0.46, 0.42, 0.52, 6.75, 0.21, 2.55, materials.porcelainMat);
  addBox(0.2, 0.78, 0.44, 7.05, 0.48, 2.55, materials.porcelainMat, false);

  addBox(0.62, 0.8, 1.25, 6.92, 0.4, 1.0, materials.woodDarkMat);
  addBox(0.66, 0.08, 1.3, 6.92, 0.84, 1.0, materials.porcelainMat, false);
  addBox(0.42, 0.04, 0.54, 6.88, 0.87, 1.0, materials.metalMat, false);
  addBox(0.04, 0.22, 0.04, 7.12, 0.98, 1.0, materials.chromeMat, false);
  addBox(0.16, 0.04, 0.04, 7.04, 1.08, 1.0, materials.chromeMat, false);

  const bathWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.015, 0.22, 8), materials.waterStreamMat);
  bathWaterMesh.position.set(6.97, 0.97, 1.0);
  bathWaterMesh.visible = false;
  scene.add(bathWaterMesh);

  const bathFaucetObj = {
    type: 'bath_faucet',
    running: false,
    dripping: true,
    worldPos: new THREE.Vector3(6.92, 1.0, 1.0),
    label: () => bathFaucetObj.running
      ? 'Nhấn [E] khóa vòi nước phòng tắm đang chảy'
      : (bathFaucetObj.dripping ? 'Nhấn [E] vặn chặt vòi nước phòng tắm' : '')
  };
  interactables.push(bathFaucetObj);

  addBox(0.06, 1.08, 0.86, 7.22, 1.66, 1.0, materials.chromeMat, false);
  const bathMirrorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.96), materials.bathMirrorMat);
  bathMirrorMesh.position.set(7.18, 1.66, 1.0);
  bathMirrorMesh.rotation.y = -Math.PI / 2;
  scene.add(bathMirrorMesh);

  const bathMirrorObj = {
    type: 'bath_mirror',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(7.1, 1.62, 1.0),
    label: () => bathMirrorObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] soi gương phòng tắm'
  };
  interactables.push(bathMirrorObj);

  // ==========================================
  // 6. ENVIRONMENTAL STORYTELLING
  // ==========================================
  const envStoryGroup = new THREE.Group();
  scene.add(envStoryGroup);

  const brokenMugGroup = new THREE.Group();
  brokenMugGroup.position.set(-1.1, 0.015, -6.55);
  const spillPuddle = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 16),
    new THREE.MeshStandardMaterial({ color: 0x17100c, roughness: 0.14, metalness: 0.45 })
  );
  spillPuddle.rotation.x = -Math.PI / 2;
  brokenMugGroup.add(spillPuddle);

  [
    [0.08, 0.02, 0.04, 0.09, 0.04, 0.07, 0.4],
    [-0.12, 0.015, -0.06, 0.07, 0.03, 0.06, -0.8],
    [0.18, 0.012, -0.1, 0.05, 0.02, 0.05, 1.1],
    [-0.04, 0.012, 0.16, 0.06, 0.025, 0.04, 0.2]
  ].forEach(([sx, sy, sz, sw, sh, sd, ry]) => {
    const shMesh = new THREE.Mesh(getBoxGeo(sw, sh, sd), materials.shardMat);
    shMesh.position.set(sx, sy, sz); shMesh.rotation.y = ry;
    brokenMugGroup.add(shMesh);
  });
  envStoryGroup.add(brokenMugGroup);

  const brokenMugObj = {
    type: 'broken_mug',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-1.1, 0.15, -6.55),
    label: () => brokenMugObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra chiếc cốc bị ném vỡ'
  };
  interactables.push(brokenMugObj);

  const doorRainPuddle = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 22),
    new THREE.MeshStandardMaterial({ color: 0x16222c, roughness: 0.08, metalness: 0.72, transparent: true, opacity: 0.85 })
  );
  doorRainPuddle.rotation.x = -Math.PI / 2;
  doorRainPuddle.scale.set(1.3, 0.65, 1);
  doorRainPuddle.position.set(0.0, 0.014, -9.95);
  doorRainPuddle.visible = false;
  envStoryGroup.add(doorRainPuddle);

  const rainPuddleObj = {
    type: 'rain_puddle',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(0.0, 0.15, -9.95),
    label: () => (!doorRainPuddle.visible || rainPuddleObj.checkedInLoop === getState().loop)
      ? ''
      : 'Nhấn [E] kiểm tra vũng nước mưa dưới khe cửa'
  };
  interactables.push(rainPuddleObj);

  // Smartphone
  const phoneScreenCanvas = document.createElement('canvas');
  phoneScreenCanvas.width = 256; phoneScreenCanvas.height = 440;
  const phoneScreenCtx = phoneScreenCanvas.getContext('2d');
  const phoneScreenTex = new THREE.CanvasTexture(phoneScreenCanvas);

  function drawSmartphoneScreen(mode) {
    const ctx = phoneScreenCtx;
    ctx.fillStyle = '#07090e'; ctx.fillRect(0, 0, 256, 440);
    ctx.fillStyle = '#f2eee6'; ctx.font = 'bold 52px monospace'; ctx.textAlign = 'center';
    ctx.fillText(mode === 'silent' ? '02:14' : mode === 'missed' ? '02:08' : '02:09', 128, 92);
    ctx.fillStyle = '#9aa3b2'; ctx.font = '18px sans-serif';
    ctx.fillText(mode === 'silent' ? 'Không có dịch vụ' : '14 Tháng 11', 128, 126);

    if (mode === 'missed') {
      ctx.fillStyle = 'rgba(212, 77, 66, 0.28)';
      ctx.fillRect(18, 168, 220, 104);
      ctx.strokeStyle = '#ff5a50'; ctx.lineWidth = 3;
      ctx.strokeRect(18, 168, 220, 104);
      ctx.fillStyle = '#ff7b72'; ctx.font = 'bold 23px sans-serif';
      ctx.fillText('4 CUỘC GỌI NHỠ', 128, 204);
      ctx.fillStyle = '#f5e8e6'; ctx.font = '19px sans-serif';
      ctx.fillText('Alice · 02:08 (Im lặng)', 128, 240);
    } else if (mode === 'voicemail') {
      ctx.fillStyle = 'rgba(232, 155, 76, 0.24)';
      ctx.fillRect(18, 168, 220, 108);
      ctx.strokeStyle = '#f7c37c'; ctx.lineWidth = 3;
      ctx.strokeRect(18, 168, 220, 108);
      ctx.fillStyle = '#f7c37c'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText('TIN NHẮN THOẠI', 128, 204);
      ctx.fillStyle = '#f5efe6'; ctx.font = '19px sans-serif';
      ctx.fillText('Alice · 02:09 (0:34)', 128, 242);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(22, 180, 212, 64);
      ctx.fillStyle = '#b9c0cc'; ctx.font = '18px sans-serif';
      ctx.fillText('Không có thông báo', 128, 218);
    }
    phoneScreenTex.needsUpdate = true;
  }
  drawSmartphoneScreen('silent');

  const smartphoneGroup = new THREE.Group();
  smartphoneGroup.position.set(-2.55, 0.81, -5.55);
  smartphoneGroup.rotation.y = 0.25;
  const smBody = new THREE.Mesh(getBoxGeo(0.11, 0.012, 0.2), materials.metalMat);
  const smScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.095, 0.175), new THREE.MeshBasicMaterial({ map: phoneScreenTex }));
  smScreen.rotation.x = -Math.PI / 2;
  smScreen.position.y = 0.008;
  // Glow sprite proxy instead of PointLight
  const smLight = createGlowProxy(smartphoneGroup, 0x88b4ff, [0, 0.14, 0], 0.42, 0.35, 0.55);
  smartphoneGroup.add(smBody, smScreen);
  envStoryGroup.add(smartphoneGroup);

  const smartphoneObj = {
    type: 'smartphone',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-2.55, 0.85, -5.55),
    label: () => smartphoneObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] nhìn màn hình điện thoại'
  };
  interactables.push(smartphoneObj);

  // Shared multiplexed dynamic FX PointLight for ambulance siren, emergency red, & dawn glow
  // Collapses 4 mutually-exclusive PointLights into 1 real Three.js PointLight!
  const dynamicFxLight = new THREE.PointLight(0xff2218, 0, 16, 1.4);
  dynamicFxLight.position.set(0, 2.5, -5.5);
  scene.add(dynamicFxLight);

  const fxState = {
    ambRed: 0,
    ambBlue: 0,
    emergency: 0,
    dawn: 0
  };
  function syncDynamicFxLight() {
    if (fxState.dawn > 0.05) {
      dynamicFxLight.color.setHex(0xffd28a);
      dynamicFxLight.position.set(0, 2.2, -12.0);
      dynamicFxLight.distance = 28;
      dynamicFxLight.intensity = fxState.dawn;
    } else if (fxState.emergency > 0.05) {
      dynamicFxLight.color.setHex(0xff2218);
      dynamicFxLight.position.set(0, 2.5, -5.5);
      dynamicFxLight.distance = 16;
      dynamicFxLight.intensity = fxState.emergency;
    } else if (fxState.ambRed > 0.1 || fxState.ambBlue > 0.1) {
      if (fxState.ambRed >= fxState.ambBlue) {
        dynamicFxLight.color.setHex(0xff2620);
        dynamicFxLight.position.set(-3.4, 2.0, -6.0);
        dynamicFxLight.distance = 12;
        dynamicFxLight.intensity = fxState.ambRed;
      } else {
        dynamicFxLight.color.setHex(0x207bff);
        dynamicFxLight.position.set(-3.0, 2.0, 1.6);
        dynamicFxLight.distance = 12;
        dynamicFxLight.intensity = fxState.ambBlue;
      }
    } else {
      dynamicFxLight.intensity = 0;
    }
  }

  function createFxChannelProxy(key, hexColor) {
    const color = new THREE.Color(hexColor);
    return {
      color,
      get intensity() {
        return fxState[key];
      },
      set intensity(v) {
        fxState[key] = Number.isFinite(v) ? Math.max(0, v) : 0;
        syncDynamicFxLight();
      }
    };
  }

  const ambRedLight = createFxChannelProxy('ambRed', 0xff2620);
  const ambBlueLight = createFxChannelProxy('ambBlue', 0x207bff);
  const emergencyRedLight = createFxChannelProxy('emergency', 0xff2218);
  const dawnLight = createFxChannelProxy('dawn', 0xffd28a);

  // White Memorial Flowers (shared geometries)
  const flowersGroup = new THREE.Group();
  flowersGroup.position.set(-3.25, 0.02, -3.4);
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.36, 6);
  const blossomGeo = new THREE.SphereGeometry(0.042, 8, 8);
  const coreGeo = new THREE.SphereGeometry(0.016, 6, 6);
  for (let f = 0; f < 5; f++) {
    const ang = (f - 2) * 0.24;
    const stem = new THREE.Mesh(stemGeo, materials.stemMat);
    stem.position.set(Math.sin(ang) * 0.08, 0.04, Math.cos(ang) * 0.05);
    stem.rotation.z = Math.PI / 2 - 0.15;
    stem.rotation.y = ang;
    flowersGroup.add(stem);
    const blossom = new THREE.Mesh(blossomGeo, materials.petalMat);
    blossom.scale.set(1, 0.55, 1);
    blossom.position.set(0.16 + Math.sin(ang) * 0.09, 0.06 + (f % 2) * 0.02, (f - 2) * 0.065);
    flowersGroup.add(blossom);
    const core = new THREE.Mesh(coreGeo, materials.centerMat);
    core.position.copy(blossom.position); core.position.y += 0.018;
    flowersGroup.add(core);
  }
  flowersGroup.visible = false;
  envStoryGroup.add(flowersGroup);

  // Kitchen breaker guide glow proxy instead of PointLight
  const kitchenGuideLight = createGlowProxy(scene, 0xff3b30, [-4.35, 1.65, -2.2], 0.95, 0, 0.65);

  // Floating Dust Particles
  const dustCount = 260, dustGeo = new THREE.BufferGeometry(), dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = -8.0 + Math.random() * 15.6;
    dustPos[i * 3 + 1] = 0.2 + Math.random() * 2.8;
    dustPos[i * 3 + 2] = -10.2 + Math.random() * 14.2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustPoints = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0xd8cdb8, size: 0.028, transparent: true, opacity: 0.35, depthWrite: false })
  );
  scene.add(dustPoints);

  // ==========================================
  // 7. ALLEYWAY OUTSIDE FRONT DOOR
  // ==========================================
  addBox(6.8, 0.25, 76, 0, -0.14, -48.0, materials.wetAsphaltMat, false, false, true);
  addBox(0.35, 4.8, 74, -2.9, 2.3, -47.5, materials.alleyWallMat);
  addBox(0.35, 4.8, 74, 2.9, 2.3, -47.5, materials.alleyWallMat);

  // Instanced alleyway poles, crossbars, arms, housings, wires, & bulbs (42 meshes -> 6 draw calls!)
  const alleyLights = [];
  const poleZs = [-15.5, -23.5, -31.5, -39.5, -47.5, -55.5];
  const poleCount = poleZs.length;
  const instPole = new THREE.InstancedMesh(getBoxGeo(0.18, 4.9, 0.18), materials.metalMat, poleCount);
  const instCross = new THREE.InstancedMesh(getBoxGeo(0.65, 0.08, 0.08), materials.metalMat, poleCount);
  const instArm = new THREE.InstancedMesh(getBoxGeo(1.05, 0.07, 0.07), materials.metalMat, poleCount);
  const instHead = new THREE.InstancedMesh(getBoxGeo(0.34, 0.08, 0.22), materials.metalMat, poleCount);
  const instWire = new THREE.InstancedMesh(getBoxGeo(5.6, 0.02, 0.02), materials.metalMat, poleCount * 2);
  const instBulb = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.13, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    poleCount
  );

  const alleyDummy = new THREE.Object3D();
  const bulbColor = new THREE.Color();

  poleZs.forEach((az, idx) => {
    const side = idx % 2 === 0 ? -1 : 1;
    const px = side * 2.55;

    alleyDummy.rotation.set(0, 0, 0);
    alleyDummy.scale.set(1, 1, 1);

    alleyDummy.position.set(px, 2.45, az);
    alleyDummy.updateMatrix();
    instPole.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(px, 4.65, az);
    alleyDummy.updateMatrix();
    instCross.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(px - side * 0.52, 4.35, az);
    alleyDummy.updateMatrix();
    instArm.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(px - side * 0.98, 4.30, az);
    alleyDummy.updateMatrix();
    instHead.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(0, 4.55, az);
    alleyDummy.updateMatrix();
    instWire.setMatrixAt(idx * 2, alleyDummy.matrix);

    alleyDummy.position.set(0, 4.35, az + 0.18);
    alleyDummy.updateMatrix();
    instWire.setMatrixAt(idx * 2 + 1, alleyDummy.matrix);

    const bulbX = px - side * 0.98;
    alleyDummy.position.set(bulbX, 4.20, az);
    alleyDummy.updateMatrix();
    instBulb.setMatrixAt(idx, alleyDummy.matrix);
    bulbColor.setHex(idx >= 3 ? 0xfff3d4 : 0xffc675);
    instBulb.setColorAt(idx, bulbColor);

    // Volumetric-style additive halo sprite instead of 6 PointLights!
    const halo = createGlowProxy(
      scene,
      idx >= 3 ? 0xfff0cc : 0xffb35c,
      [bulbX, 3.95, az],
      3.1 + idx * 0.35,
      1.85 + idx * 0.35,
      0.85
    );
    alleyLights.push(halo);
  });

  [instPole, instCross, instArm, instHead, instWire, instBulb].forEach((im) => {
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    scene.add(im);
  });

  addBox(0.02, 0.02, 42, -2.25, 4.62, -31.5, materials.metalMat, false, false, false);
  addBox(0.02, 0.02, 42, 2.25, 4.62, -31.5, materials.metalMat, false, false, false);
  addBox(0.65, 0.85, 0.65, -2.3, 0.42, -14.2, materials.metalMat);
  addBox(0.75, 0.6, 0.75, 2.3, 0.3, -21.0, materials.woodDarkMat);
  addBox(0.65, 0.9, 0.65, -2.3, 0.45, -29.5, materials.metalMat);

  // Additive bloom beacon instead of extra PointLight
  const exitBeacon = createGlowProxy(scene, 0xfff4d6, [0, 3.4, -58.0], 11.5, 5.5, 0.9);
  const exitGlowWall = new THREE.Mesh(
    new THREE.PlaneGeometry(16.0, 11.0),
    new THREE.MeshBasicMaterial({ color: 0xfff6e0, transparent: true, opacity: 0.82, depthWrite: false })
  );
  exitGlowWall.position.set(0, 3.0, -66.0);
  scene.add(exitGlowWall);

  return {
    lights: {
      bedroomLampLight,
      livingWindowMoon,
      tvLight,
      fridgeLight,
      bathLight,
      studyLampLight,
      kitchenGuideLight,
      clockGlow,
      ambRedLight,
      ambBlueLight,
      emergencyRedLight,
      alleyLights,
      dawnLight,
      exitBeacon,
      smLight
    },
    objects: {
      clockMesh,
      drawClockFace,
      clockAnomalyObj,
      wardrobeDoorPivot,
      wardrobeDoorPivot2,
      wardrobeEyes,
      wardrobeObj,
      secondPillowMesh,
      mirrorMesh,
      mirrorObj,
      portraitGroup,
      portraitMesh,
      portraitAnomalyObj,
      chairGroup,
      chairAnomalyObj,
      phoneGroup,
      phoneLed,
      phoneObj,
      tvMesh,
      tvScreen,
      tvObj,
      wallScrawl,
      scrawlAnomalyObj,
      kitchenWaterMesh,
      kitchenFaucetObj,
      kitchenNoteMesh,
      kitchenNoteObj,
      fridgeGroup: fridgeDoorPivot,
      fridgeDoorPivot,
      fridgeDoorMesh,
      fridgeObj,
      bathWaterMesh,
      bathFaucetObj,
      bathMirrorMesh,
      bathMirrorObj,
      brokenMugGroup,
      brokenMugObj,
      doorRainPuddle,
      rainPuddleObj,
      smartphoneGroup,
      smartphoneObj,
      drawSmartphoneScreen,
      flowersGroup,
      dustPoints
    },
    updateWindowRain
  };
}
```

---

### <a id="src-world-materials-js"></a> Tập tin: `src/world/materials.js` (143 dòng)

```javascript
import * as THREE from 'three';
import {
  makePlasterPBR,
  makeHardwoodPBR,
  makePanelDoorTexture,
  makeFabricTexture,
  makeMirrorTex,
  makePortraitTexture,
  makeBathMirrorTex,
  makeWallScrawl,
  makeAlleyWallTex,
  makeHeldPaperTexture,
  makeGlintTex
} from './textures.js';

export function createMaterials() {
  const plasterPBR = makePlasterPBR();
  const floorPBR = makeHardwoodPBR();

  const wallMat = new THREE.MeshStandardMaterial({
    map: plasterPBR.map,
    bumpMap: plasterPBR.bumpMap,
    bumpScale: 0.025,
    roughness: 0.9
  });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x1e1d1b, roughness: 0.96 });
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorPBR.map,
    bumpMap: floorPBR.bumpMap,
    bumpScale: 0.018,
    roughness: 0.58,
    metalness: 0.06
  });
  const doorMat = new THREE.MeshStandardMaterial({ map: makePanelDoorTexture(), roughness: 0.72 });
  const woodRichMat = new THREE.MeshStandardMaterial({ color: 0x382417, roughness: 0.62, metalness: 0.05 });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x24170f, roughness: 0.72 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc89e52, roughness: 0.3, metalness: 0.85 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.4, metalness: 0.75 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xaab4be, roughness: 0.2, metalness: 0.88 });
  const blanketMat = new THREE.MeshStandardMaterial({ map: makeFabricTexture('#3b424d'), roughness: 0.95 });
  const pillowMat = new THREE.MeshStandardMaterial({ map: makeFabricTexture('#c2bcb0'), roughness: 0.92 });
  const sofaMat = new THREE.MeshStandardMaterial({ map: makeFabricTexture('#302622'), roughness: 0.94 });
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xcbd2d8, roughness: 0.25, metalness: 0.08 });
  const counterTopMat = new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.38, metalness: 0.12 });
  const waterStreamMat = new THREE.MeshBasicMaterial({ color: 0x9fd2e6, transparent: true, opacity: 0.65 });
  const fridgeBodyMat = new THREE.MeshStandardMaterial({ color: 0x8e969e, roughness: 0.35, metalness: 0.25 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xd2ccc2, roughness: 0.35 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x26422a, roughness: 0.85 });
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xf4f2eb, emissive: 0x24221d, roughness: 0.7 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xd9b24c, roughness: 0.6 });
  const breakerLedMat = new THREE.MeshBasicMaterial({ color: 0x38d97c });
  const alleyWallMat = new THREE.MeshStandardMaterial({ map: makeAlleyWallTex(), roughness: 0.94 });
  const wetAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.28, metalness: 0.25 });
  const tvScreenMat = new THREE.MeshBasicMaterial({ color: 0x080a0d });
  const weMat = new THREE.MeshBasicMaterial({ color: 0xeafff9 });

  const mirrorCleanTex = makeMirrorTex(false, false);
  const mirrorGhostTex = makeMirrorTex(true, true);
  const mirrorCrackedTex = makeMirrorTex(true, false);
  const mirrorMat = new THREE.MeshStandardMaterial({ map: mirrorCleanTex, roughness: 0.14, metalness: 0.78 });

  const portraitCleanTex = makePortraitTexture(false);
  const portraitScratchedTex = makePortraitTexture(true);
  const portraitMat = new THREE.MeshStandardMaterial({ map: portraitCleanTex, roughness: 0.65 });

  const bathMirrorCleanTex = makeBathMirrorTex('clean');
  const bathMirrorFogTex = makeBathMirrorTex('fog');
  const bathMirrorGhostTex = makeBathMirrorTex('ghost');
  const bathMirrorCrackedTex = makeBathMirrorTex('cracked');
  const bathMirrorMat = new THREE.MeshStandardMaterial({ map: bathMirrorCleanTex, roughness: 0.14, metalness: 0.78 });

  const scrawlTex2 = makeWallScrawl('SAO ANH KHÔNG MỞ?', 'Ngoài này lạnh quá...');
  const scrawlTex3 = makeWallScrawl('ĐÃ 3 TUẦN TỪ 14/11', 'Không phải kẻ lạ đâu');
  const scrawlTex4 = makeWallScrawl('NGƯỜI GÕ CỬA LÀ ALICE', 'Chính anh đã chốt khóa');
  const scrawlTex5 = makeWallScrawl('MỞ CHỐT KHÓA RA', 'Bước khỏi đêm 14/11');
  const wallScrawlMat = new THREE.MeshStandardMaterial({ map: scrawlTex2, transparent: true, roughness: 0.9 });

  const heldPaperMat = new THREE.MeshBasicMaterial({ map: makeHeldPaperTexture('clue', 1), depthTest: false });

  const coreShadowMat = new THREE.MeshBasicMaterial({ color: 0x030305 });
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x010204,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf4f7ff });

  const glintTex = makeGlintTex();

  return {
    plasterPBR,
    floorPBR,
    wallMat,
    ceilingMat,
    floorMat,
    doorMat,
    woodRichMat,
    woodDarkMat,
    brassMat,
    metalMat,
    chromeMat,
    blanketMat,
    pillowMat,
    sofaMat,
    porcelainMat,
    counterTopMat,
    waterStreamMat,
    fridgeBodyMat,
    shardMat,
    stemMat,
    petalMat,
    centerMat,
    breakerLedMat,
    alleyWallMat,
    wetAsphaltMat,
    tvScreenMat,
    weMat,
    mirrorCleanTex,
    mirrorGhostTex,
    mirrorCrackedTex,
    mirrorMat,
    portraitCleanTex,
    portraitScratchedTex,
    portraitMat,
    bathMirrorCleanTex,
    bathMirrorFogTex,
    bathMirrorGhostTex,
    bathMirrorCrackedTex,
    bathMirrorMat,
    scrawlTex2,
    scrawlTex3,
    scrawlTex4,
    scrawlTex5,
    wallScrawlMat,
    heldPaperMat,
    coreShadowMat,
    mistMat,
    eyeMat,
    glintTex
  };
}
```

---

### <a id="src-world-puzzles-js"></a> Tập tin: `src/world/puzzles.js` (421 dòng)

```javascript
import * as THREE from 'three';
import { TOTAL_LOOPS, LOOP_STORY } from '../config/storyData.js';

export function createPuzzlesSystem(scene, materials, interactables, getState) {
  // Lightweight additive sprite proxy replacing micro PointLights
  function createGlowProxy(parent, hexColor, pos, baseScale, initialIntensity = 0, maxOpacity = 0.75) {
    const color = new THREE.Color(hexColor);
    const mat = new THREE.SpriteMaterial({
      map: materials.glintTex || null,
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(pos[0], pos[1], pos[2]);
    parent.add(sprite);

    let _intensity = 0;
    const sync = () => {
      const clamped = Math.max(0, _intensity);
      sprite.visible = clamped > 0.01;
      mat.opacity = Math.min(maxOpacity, clamped * 0.5);
      const s = baseScale * (0.75 + Math.min(1.5, clamped * 0.4));
      sprite.scale.set(s, s, 1);
    };

    const proxy = {
      isGlowProxy: true,
      sprite,
      color,
      position: sprite.position,
      get intensity() {
        return _intensity;
      },
      set intensity(v) {
        _intensity = Number.isFinite(v) ? v : 0;
        sync();
      }
    };
    proxy.intensity = initialIntensity;
    return proxy;
  }

  // Study key spots
  const STUDY_KEY_SPOTS = [
    { pos: new THREE.Vector3(1.52, 0.85, 3.92), hint: 'trên tủ ngăn kéo phòng ngủ' },
    { pos: new THREE.Vector3(-2.45, 1.29, -9.88), hint: 'trên kệ sách phòng khách' },
    { pos: new THREE.Vector3(-5.85, 0.90, -4.18), hint: 'trên quầy nhà bếp' }
  ];

  const studyKeyGroup = new THREE.Group();
  const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 8, 16), materials.brassMat);
  keyRing.rotation.x = Math.PI / 2;
  const keyShaft = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.012, 0.095), materials.brassMat);
  keyShaft.position.set(0, 0, 0.072);
  const keyTooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.012, 0.014), materials.brassMat);
  keyTooth1.position.set(0.012, 0, 0.092);
  const keyTooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.014), materials.brassMat);
  keyTooth2.position.set(0.01, 0, 0.112);
  studyKeyGroup.add(keyRing, keyShaft, keyTooth1, keyTooth2);
  // Glow sprite proxy instead of PointLight
  const studyKeyLight = createGlowProxy(studyKeyGroup, 0xffcf70, [0, 0.14, 0.04], 0.36, 0.48, 0.65);
  studyKeyGroup.position.copy(STUDY_KEY_SPOTS[0].pos);
  scene.add(studyKeyGroup);

  const studyKeyObj = {
    type: 'study_key',
    worldPos: STUDY_KEY_SPOTS[0].pos.clone(),
    label: () => {
      const state = getState();
      return (state.loop === 1 && !state.studyKeyFound) ? 'Nhấn [E] nhặt chìa khóa phòng làm việc' : '';
    }
  };
  interactables.push(studyKeyObj);

  // Breaker Box
  const breakerGroup = new THREE.Group();
  breakerGroup.position.set(-4.55, 1.55, -4.62);
  const breakerBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.12), materials.metalMat);
  breakerGroup.add(breakerBody);

  const breakerLeverPivot = new THREE.Group();
  breakerLeverPivot.position.set(0, -0.02, 0.07);
  const breakerLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.18, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xb8362c, roughness: 0.45 })
  );
  breakerLever.position.set(0, 0.07, 0.02);
  breakerLeverPivot.add(breakerLever);
  breakerGroup.add(breakerLeverPivot);

  const breakerLedMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), materials.breakerLedMat);
  breakerLedMesh.position.set(0.12, 0.18, 0.07);
  breakerGroup.add(breakerLedMesh);

  // Glow sprite proxy instead of PointLight
  const breakerLight = createGlowProxy(breakerGroup, 0xff382e, [0.12, 0.18, 0.16], 0.46, 0, 0.85);
  scene.add(breakerGroup);

  const breakerObj = {
    type: 'breaker',
    worldPos: new THREE.Vector3(-4.55, 1.55, -4.55),
    label: () => {
      const state = getState();
      return (state.loop === 2 && !state.breakerFixed)
        ? 'Nhấn [E] gạt cầu dao điện'
        : '';
    }
  };
  interactables.push(breakerObj);

  // Sliding Drawers
  const hplDrawers = [];
  function createSlidingDrawer(id, name, basePos, slideAxis, maxSlide, width, height, depth, noteText) {
    const grp = new THREE.Group();
    grp.position.copy(basePos);
    const front = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials.woodDarkMat);
    front.castShadow = true; front.receiveShadow = true;
    grp.add(front);

    const hMesh = new THREE.Mesh(
      new THREE.BoxGeometry(Math.abs(slideAxis.z) > 0.5 ? 0.16 : 0.03, 0.03, Math.abs(slideAxis.x) > 0.5 ? 0.16 : 0.03),
      materials.brassMat
    );
    hMesh.position.set(slideAxis.x * (width * 0.52), 0, slideAxis.z * (depth * 0.52));
    grp.add(hMesh);

    const innerNote = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xddd2ba, roughness: 0.9 })
    );
    innerNote.rotation.x = -Math.PI / 2;
    innerNote.position.set(0, height * 0.35, 0);
    grp.add(innerNote);
    scene.add(grp);

    const dr = {
      type: 'hpl_drawer',
      id,
      name,
      group: grp,
      basePos: basePos.clone(),
      slideAxis: slideAxis.clone().normalize(),
      maxSlide,
      isOpen: false,
      targetDist: 0,
      openDist: 0,
      vel: 0,
      noteText,
      inspectedInLoop: 0,
      worldPos: basePos.clone().addScaledVector(slideAxis, 0.2),
      label: () => dr.isOpen ? `Nhấn [E] đóng ${name}` : `Nhấn [E] mở ${name}`
    };
    hplDrawers.push(dr);
    interactables.push(dr);
    return dr;
  }

  createSlidingDrawer('drawer_bedroom', 'ngăn kéo tủ phòng ngủ', new THREE.Vector3(1.35, 0.62, 3.74), new THREE.Vector3(0, 0, -1), 0.36, 0.92, 0.22, 0.42, 'Bên trong ngăn kéo chỉ còn hộp diêm cũ rỗng và chiếc kẹp tóc của Alice.');
  createSlidingDrawer('drawer_study', 'ngăn kéo bàn làm việc', new THREE.Vector3(6.95, 0.62, -4.3), new THREE.Vector3(-1, 0, 0), 0.36, 0.42, 0.18, 0.48, 'Ngăn kéo bàn làm việc chứa vài tờ lịch cũ đã xé nham nhở.');
  createSlidingDrawer('drawer_kitchen', 'ngăn kéo tủ bếp', new THREE.Vector3(-6.15, 0.66, -3.96), new THREE.Vector3(0, 0, 1), 0.34, 0.72, 0.2, 0.42, 'Trong ngăn kéo bếp có đôi đũa gỗ và tờ hóa đơn cũ nhàu nát.');

  // Throwable Props
  const hplProps = [];
  function createThrowableProp(id, name, pos, kind) {
    const grp = new THREE.Group();
    grp.position.copy(pos);
    let radius = 0.11;
    if (kind === 'bottle') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x3b6e56, roughness: 0.22, metalness: 0.15, transparent: true, opacity: 0.85 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.045, 0.18, 10), mat);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.036, 0.09, 10), mat);
      neck.position.y = 0.13;
      grp.add(body, neck);
      radius = 0.09;
    } else if (kind === 'mug') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.45 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.11, 10), mat);
      grp.add(cup);
      radius = 0.08;
    } else if (kind === 'book') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x6b2c26, roughness: 0.82 });
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.24), mat);
      grp.add(bk);
      radius = 0.07;
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0x8a9299, roughness: 0.38, metalness: 0.65 });
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.13, 10), mat);
      grp.add(can);
      radius = 0.08;
    }
    grp.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(grp);

    const prop = {
      type: 'hpl_prop',
      hplKind: 'prop',
      id,
      name,
      kind,
      group: grp,
      homePos: pos.clone(),
      vel: new THREE.Vector3(),
      angVel: new THREE.Vector3(),
      radius,
      isDynamic: false,
      worldPos: pos.clone(),
      label: () => `Giữ [Chuột trái] nhặt ${name} · [Chuột phải]/[G] ném đánh lạc hướng`
    };
    hplProps.push(prop);
    return prop;
  }

  createThrowableProp('prop_bottle', 'chai thủy tinh', new THREE.Vector3(-2.68, 0.89, -6.02), 'bottle');
  createThrowableProp('prop_mug', 'cốc sứ cũ', new THREE.Vector3(1.02, 0.88, 3.92), 'mug');
  createThrowableProp('prop_book', 'cuốn sổ bìa cứng', new THREE.Vector3(6.95, 0.84, -5.58), 'book');
  createThrowableProp('prop_can', 'lon thiếc', new THREE.Vector3(-6.85, 0.94, -4.15), 'can');
  createThrowableProp('prop_vase', 'bình gốm nhỏ', new THREE.Vector3(-3.38, 0.72, -8.72), 'bottle');

  // Candles — share 1 pooled PointLight (automatically snaps to nearest lit candle to player)
  // plus each candle gets its own warm additive flame halo sprite!
  const candlePoolLight = new THREE.PointLight(0xffa048, 0, 6.8, 1.8);
  scene.add(candlePoolLight);

  const candles = [];
  function syncCandlePoolLight() {
    const state = getState ? getState() : null;
    const playerPos = state && state.pos ? state.pos : null;
    let best = null;
    let bestDistSq = Infinity;
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (!c.lit || c._intensity <= 0.01) continue;
      if (!playerPos) {
        best = c;
        break;
      }
      const dSq = playerPos.distanceToSquared(c.worldPos);
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        best = c;
      }
    }
    if (best) {
      candlePoolLight.position.set(best.worldPos.x, best.worldPos.y + 0.16, best.worldPos.z);
      candlePoolLight.intensity = best._intensity;
    } else {
      candlePoolLight.intensity = 0;
    }
  }

  const holderGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.04, 10);
  const waxGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.2, 10);
  const waxMat = new THREE.MeshStandardMaterial({ color: 0xede3cf, roughness: 0.8 });
  const flameGeo = new THREE.SphereGeometry(0.026, 8, 8);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd06e });

  function createCandle(id, x, y, z, initiallyLit) {
    const group = new THREE.Group(); group.position.set(x, y, z); scene.add(group);
    const holder = new THREE.Mesh(holderGeo, materials.brassMat);
    holder.position.y = 0.02; group.add(holder);
    const wax = new THREE.Mesh(waxGeo, waxMat);
    wax.position.y = 0.13; group.add(wax);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.26; flame.scale.set(0.8, 1.5, 0.8); flame.visible = initiallyLit; group.add(flame);

    const halo = createGlowProxy(group, 0xffa048, [0, 0.30, 0], 0.58, initiallyLit ? 1.45 : 0, 0.72);
    const c = {
      type: 'candle',
      id,
      flame,
      _intensity: initiallyLit ? 1.45 : 0,
      worldPos: new THREE.Vector3(x, y + 0.18, z),
      lit: initiallyLit,
      label: () => c.lit ? '' : 'Nhấn [E] thắp nến'
    };
    c.light = {
      color: halo.color,
      get intensity() {
        return c._intensity;
      },
      set intensity(v) {
        c._intensity = Number.isFinite(v) ? Math.max(0, v) : 0;
        halo.intensity = c._intensity;
        syncCandlePoolLight();
      }
    };
    candles.push(c); interactables.push(c);
    syncCandlePoolLight();
    return c;
  }

  createCandle('candle_living', -2.3, 0.8, -5.8, false);
  createCandle('candle_study', 7.1, 0.82, -5.6, false);
  createCandle('candle_kitchen', -7.45, 0.88, -4.2, false);

  // Matchbox pickup
  const MATCHBOX_SPOTS = {
    2: new THREE.Vector3(-6.28, 0.90, -4.18),
    3: new THREE.Vector3(6.72, 0.90, 1.38),
    4: new THREE.Vector3(-6.28, 0.90, -4.18),
    5: new THREE.Vector3(6.72, 0.90, 1.38)
  };
  const matchboxGroup = new THREE.Group();
  const mbOuter = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.032, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x9e3228, roughness: 0.72 })
  );
  const mbLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.085, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xe8d5a8, roughness: 0.8 })
  );
  mbLabel.rotation.x = -Math.PI / 2;
  mbLabel.position.y = 0.017;
  matchboxGroup.add(mbOuter, mbLabel);
  matchboxGroup.visible = false;
  scene.add(matchboxGroup);

  const matchboxObj = {
    type: 'matchbox',
    pickedInLoop: 0,
    worldPos: new THREE.Vector3(-6.28, 0.92, -4.18),
    label: () => {
      const state = getState();
      return (state.loop >= 2 && matchboxObj.pickedInLoop !== state.loop)
        ? 'Nhấn [E] nhặt hộp diêm (+3 que)'
        : '';
    }
  };
  interactables.push(matchboxObj);

  // Clue item on study desk
  const clueGroup = new THREE.Group();
  clueGroup.position.set(7.05, 0.88, -4.95);
  scene.add(clueGroup);
  const clueMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.06, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0xf0b566,
      emissive: 0xd98f3a,
      emissiveIntensity: 0.55,
      roughness: 0.4
    })
  );
  clueGroup.add(clueMesh);
  // Glow sprite proxy instead of PointLight
  const clueLight = createGlowProxy(clueGroup, 0xf2b56b, [0, 0.18, 0], 0.52, 0.65, 0.65);

  const clueObj = {
    type: 'clue',
    group: clueGroup,
    mesh: clueMesh,
    worldPos: new THREE.Vector3(7.05, 0.9, -4.95),
    label: () => {
      const state = getState();
      if (state.loopClueFound) return '';
      if (state.anomaliesFound < state.anomaliesRequired) {
        return `Hồ sơ trên bàn (Kiểm tra thêm ${state.anomaliesRequired - state.anomaliesFound} điểm bất thường trước)`;
      }
      if (state.loop === 2 && !state.breakerFixed) return 'Hồ sơ trên bàn (Tối om — cần bật cầu dao trong Nhà bếp)';
      if (state.loop === TOTAL_LOOPS && !state.codeUnlocked) return 'Nhấn [E] mở khóa mã 4 số hộp hồ sơ';
      return `Nhấn [E] xem: ${LOOP_STORY[state.loop].clueTitle}`;
    }
  };
  interactables.push(clueObj);

  // Item Glints
  const itemGlints = [];
  function createItemGlint(pos, isActiveFn) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: materials.glintTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sp.position.copy(pos);
    sp.scale.set(0.24, 0.24, 1);
    scene.add(sp);
    const entry = { sprite: sp, basePos: pos.clone(), isActiveFn };
    itemGlints.push(entry);
    return entry;
  }

  const keyGlint = createItemGlint(STUDY_KEY_SPOTS[0].pos.clone().add(new THREE.Vector3(0, 0.09, 0)), () => {
    const s = getState();
    return s.loop === 1 && !s.studyKeyFound;
  });
  const matchboxGlint = createItemGlint(new THREE.Vector3(-6.28, 0.99, -4.18), () => {
    const s = getState();
    return s.loop >= 2 && matchboxObj.pickedInLoop !== s.loop;
  });

  return {
    STUDY_KEY_SPOTS,
    studyKeyGroup,
    studyKeyLight,
    studyKeyObj,
    keyGlint,
    breakerGroup,
    breakerLever,
    breakerLeverPivot,
    breakerLight,
    breakerObj,
    hplDrawers,
    createSlidingDrawer,
    hplProps,
    createThrowableProp,
    candles,
    createCandle,
    MATCHBOX_SPOTS,
    matchboxGroup,
    matchboxObj,
    matchboxGlint,
    clueGroup,
    clueMesh,
    clueLight,
    clueObj,
    itemGlints,
    createItemGlint
  };
}
```

---

### <a id="src-world-textures-js"></a> Tập tin: `src/world/textures.js` (483 dòng)

```javascript
import * as THREE from 'three';
import { getHeldPaperContent, wrapCanvasText } from '../config/heldPaperContent.js';

export function makePlasterPBR() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const b = document.createElement('canvas'); b.width = 512; b.height = 512;
  const bctx = b.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#2a2824'); grad.addColorStop(0.68, '#38342d'); grad.addColorStop(0.7, '#1d1915'); grad.addColorStop(1, '#1a1511');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#808080'; bctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 512, y = Math.random() * 360, sz = 3 + Math.random() * 14, v = 36 + Math.floor(Math.random() * 24);
    ctx.fillStyle = `rgba(${v},${v - 2},${v - 6},0.16)`; ctx.fillRect(x, y, sz, sz);
    const bv = 110 + Math.floor(Math.random() * 35); bctx.fillStyle = `rgba(${bv},${bv},${bv},0.25)`; bctx.fillRect(x, y, sz, sz);
  }
  ctx.fillStyle = '#2b2017'; ctx.fillRect(0, 352, 512, 14);
  bctx.fillStyle = '#d0d0d0'; bctx.fillRect(0, 352, 512, 14);
  for (let x = 16; x < 512; x += 128) {
    ctx.strokeStyle = '#120d09'; ctx.lineWidth = 4; ctx.strokeRect(x, 382, 96, 98);
    bctx.strokeStyle = '#303030'; bctx.lineWidth = 5; bctx.strokeRect(x, 382, 96, 98);
  }
  ctx.fillStyle = '#16100b'; ctx.fillRect(0, 492, 512, 20);
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(b);
  [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.5, 1); });
  return { map, bumpMap };
}

export function makeHardwoodPBR() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const b = document.createElement('canvas'); b.width = 512; b.height = 512;
  const bctx = b.getContext('2d');
  ctx.fillStyle = '#1d140e'; ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#707070'; bctx.fillRect(0, 0, 512, 512);
  const plankW = 64;
  for (let x = 0; x < 512; x += plankW) {
    const baseR = 46 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${baseR},${Math.floor(baseR * 0.68)},${Math.floor(baseR * 0.44)})`;
    ctx.fillRect(x + 2, 0, plankW - 4, 512);
    for (let g = 0; g < 18; g++) {
      ctx.fillStyle = `rgba(18,10,6,${0.08 + Math.random() * 0.14})`;
      ctx.fillRect(x + 4 + Math.random() * (plankW - 8), 0, 1.5, 512);
    }
    ctx.fillStyle = '#0c0704'; ctx.fillRect(x, 0, 2, 512);
    bctx.fillStyle = '#181818'; bctx.fillRect(x, 0, 3, 512);
    const jy = ((x / plankW) % 2) * 256 + 128;
    ctx.fillStyle = '#0c0704'; ctx.fillRect(x, jy, plankW, 2);
    bctx.fillStyle = '#181818'; bctx.fillRect(x, jy, plankW, 3);
  }
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(b);
  [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4.5, 6); });
  return { map, bumpMap };
}

export function makeTileFloorTex(c1, c2) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const step = 64;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      ctx.fillStyle = ((x / step + y / step) % 2 === 0) ? c1 : c2;
      ctx.fillRect(x, y, step, step);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, step - 2, step - 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function makeBathMirrorTex(mode) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 320);
  g.addColorStop(0, '#33424c'); g.addColorStop(0.5, '#1e2830'); g.addColorStop(1, '#12181e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 320);

  const fogAlpha = mode === 'clean' ? 0.14 : 0.34;
  const fog = ctx.createRadialGradient(128, 160, 20, 128, 160, 165);
  fog.addColorStop(0, `rgba(210, 226, 232, ${fogAlpha})`);
  fog.addColorStop(1, 'rgba(180, 200, 210, 0.05)');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, 256, 320);

  if (mode === 'ghost') {
    ctx.fillStyle = 'rgba(220, 238, 236, 0.72)';
    ctx.beginPath(); ctx.ellipse(128, 145, 38, 52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#05070a';
    ctx.beginPath(); ctx.arc(112, 136, 8, 0, Math.PI * 2); ctx.arc(144, 136, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(128, 174, 12, 20, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (mode === 'fog0214' || mode === 'ghost') {
    ctx.fillStyle = 'rgba(18, 28, 34, 0.85)';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('02:14', 128, 245);
    ctx.strokeStyle = 'rgba(18, 28, 34, 0.55)';
    ctx.lineWidth = 3;
    [82, 114, 152, 176].forEach((dx) => {
      ctx.beginPath(); ctx.moveTo(dx, 252); ctx.lineTo(dx, 285 + Math.random() * 20); ctx.stroke();
    });
  }
  if (mode === 'cracked') {
    ctx.fillStyle = 'rgba(18, 26, 32, 0.82)';
    ctx.font = 'bold 26px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ĐỪNG TRỐN NỮA', 128, 235);
    ctx.strokeStyle = 'rgba(235, 246, 255, 0.86)';
    ctx.lineWidth = 2;
    [[128, 120, 18, 36], [128, 120, 244, 72], [128, 120, 48, 305], [128, 120, 215, 290], [128, 120, 128, 8]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + 10, (y1 + y2) / 2 - 6); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }
  return new THREE.CanvasTexture(c);
}

export function makeRugTexture(primary, accent) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = primary; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = accent; ctx.lineWidth = 14; ctx.strokeRect(26, 26, 460, 460);
  ctx.lineWidth = 4; ctx.strokeRect(52, 52, 408, 408);
  ctx.beginPath(); ctx.moveTo(256, 120); ctx.lineTo(370, 256); ctx.lineTo(256, 392); ctx.lineTo(142, 256); ctx.closePath();
  ctx.strokeStyle = accent; ctx.lineWidth = 8; ctx.stroke();
  for (let y = 0; y < 512; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, y, 512, 1); }
  return new THREE.CanvasTexture(c);
}

export function makeFabricTexture(baseHex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d'); ctx.fillStyle = baseHex; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 4) {
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(0, i, 256, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(i, 0, 1, 256);
  }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
  return tex;
}

export function makePanelDoorTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#3a2619'; ctx.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 90; i++) { ctx.fillStyle = 'rgba(18,10,5,0.12)'; ctx.fillRect(Math.random() * 256, 0, 2, 512); }
  [[28, 36, 86, 185], [142, 36, 86, 185], [28, 260, 86, 210], [142, 260, 86, 210]].forEach(([x, y, w, h]) => {
    ctx.fillStyle = '#2d1c12'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#180e08'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,215,175,0.08)'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  });
  return new THREE.CanvasTexture(c);
}

export function makeClockTexture(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#070709'; ctx.fillRect(0, 0, 256, 128);
  ctx.shadowColor = '#ff3b30'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#ff4a3d'; ctx.font = 'bold 76px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 66);
  return new THREE.CanvasTexture(c);
}

export function makePortraitTexture(scratched) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  const bg = ctx.createRadialGradient(128, 130, 20, 128, 160, 180);
  bg.addColorStop(0, '#3a322a'); bg.addColorStop(1, '#12100e');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = '#5c4e41';
  ctx.beginPath(); ctx.arc(96, 118, 28, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(60, 152, 72, 140);
  ctx.beginPath(); ctx.arc(162, 130, 24, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(130, 160, 64, 132);
  if (scratched) {
    ctx.strokeStyle = '#0d0505'; ctx.lineWidth = 7;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath(); ctx.moveTo(46 + Math.random() * 160, 82 + Math.random() * 76);
      ctx.lineTo(46 + Math.random() * 160, 82 + Math.random() * 76); ctx.stroke();
    }
  }
  return new THREE.CanvasTexture(c);
}

export function makeMirrorTex(cracked, ghostly) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 384;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 384);
  g.addColorStop(0, '#2a333c'); g.addColorStop(0.5, '#192028'); g.addColorStop(1, '#10141a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 384);
  if (ghostly) {
    ctx.fillStyle = 'rgba(215, 232, 226, 0.72)';
    ctx.beginPath(); ctx.ellipse(128, 155, 42, 58, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#050608';
    ctx.beginPath(); ctx.arc(110, 145, 9, 0, Math.PI * 2); ctx.arc(146, 145, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(128, 185, 14, 24, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (cracked) {
    ctx.strokeStyle = 'rgba(235, 245, 255, 0.85)'; ctx.lineWidth = 2;
    [[128, 160, 20, 40], [128, 160, 240, 85], [128, 160, 45, 350], [128, 160, 225, 310], [128, 160, 128, 10]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + 12, (y1 + y2) / 2 - 8); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }
  return new THREE.CanvasTexture(c);
}

export function makeWallScrawl(line1, line2) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = 'rgba(182, 34, 26, 0.88)'; ctx.font = 'bold 38px "Times New Roman", serif'; ctx.fillText(line1, 24, 118);
  ctx.fillStyle = 'rgba(162, 32, 24, 0.8)'; ctx.font = 'italic 28px "Times New Roman", serif'; ctx.fillText(line2, 24, 172);
  return new THREE.CanvasTexture(c);
}

export function makeAlleyWallTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#1e2022'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 650; i++) {
    const v = 22 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgba(${v},${v + 2},${v + 1},0.35)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 14, 14);
  }
  for (let x = 12; x < 256; x += 48) {
    ctx.fillStyle = 'rgba(14, 22, 16, 0.45)';
    ctx.fillRect(x, 0, 10 + Math.random() * 14, 256);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1.5);
  return t;
}

export function makeFlameSpriteTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 256);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.bezierCurveTo(106, 98, 114, 178, 64, 232);
  ctx.bezierCurveTo(14, 178, 22, 98, 64, 18);
  ctx.closePath();
  const gOuter = ctx.createRadialGradient(64, 178, 8, 64, 148, 102);
  gOuter.addColorStop(0.0, 'rgba(255, 248, 200, 0.98)');
  gOuter.addColorStop(0.32, 'rgba(255, 195, 65, 0.92)');
  gOuter.addColorStop(0.68, 'rgba(255, 92, 16, 0.65)');
  gOuter.addColorStop(1.0, 'rgba(210, 30, 0, 0.0)');
  ctx.fillStyle = gOuter;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(64, 92);
  ctx.bezierCurveTo(86, 146, 88, 194, 64, 218);
  ctx.bezierCurveTo(40, 194, 42, 146, 64, 92);
  ctx.closePath();
  const gInner = ctx.createRadialGradient(64, 182, 4, 64, 170, 52);
  gInner.addColorStop(0.0, 'rgba(255, 255, 245, 1.0)');
  gInner.addColorStop(0.55, 'rgba(255, 225, 120, 0.85)');
  gInner.addColorStop(1.0, 'rgba(255, 140, 30, 0.0)');
  ctx.fillStyle = gInner;
  ctx.fill();
  ctx.restore();

  const gBlue = ctx.createRadialGradient(64, 218, 2, 64, 218, 24);
  gBlue.addColorStop(0.0, 'rgba(110, 175, 255, 0.72)');
  gBlue.addColorStop(1.0, 'rgba(70, 130, 255, 0.0)');
  ctx.fillStyle = gBlue;
  ctx.beginPath();
  ctx.arc(64, 218, 24, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(c);
}

export function makeGlowHaloTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0.0, 'rgba(255, 170, 70, 0.55)');
  g.addColorStop(0.45, 'rgba(255, 95, 20, 0.22)');
  g.addColorStop(1.0, 'rgba(255, 60, 0, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function makeGlintTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0.0, 'rgba(255, 246, 210, 0.95)');
  g.addColorStop(0.35, 'rgba(247, 195, 124, 0.45)');
  g.addColorStop(1.0, 'rgba(247, 195, 124, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function makeHeldPaperTexture(kind, loopNum) {
  const info = getHeldPaperContent(kind, loopNum);
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 960;
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 768, 960);
  if (info.theme === 'sticky') {
    grad.addColorStop(0, '#efe1a8'); grad.addColorStop(1, '#d9c57f');
  } else if (info.theme === 'wet') {
    grad.addColorStop(0, '#d2d4ce'); grad.addColorStop(1, '#b1b7b0');
  } else if (info.theme === 'frost') {
    grad.addColorStop(0, '#d7e8f0'); grad.addColorStop(1, '#aac6d4');
  } else if (info.theme === 'scrawl') {
    grad.addColorStop(0, '#c7bfb2'); grad.addColorStop(1, '#a3998b');
  } else if (info.theme === 'calendar') {
    grad.addColorStop(0, '#ddd2ba'); grad.addColorStop(1, '#c8ba9d');
  } else if (info.theme === 'report') {
    grad.addColorStop(0, '#cfc7b6'); grad.addColorStop(1, '#b6ac98');
  } else {
    grad.addColorStop(0, '#c8c3b8'); grad.addColorStop(1, '#aaa497');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 960);

  for (let i = 0; i < 800; i++) {
    const v = 90 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${v},${v - 8},${v - 16},0.06)`;
    ctx.fillRect(Math.random() * 768, Math.random() * 960, 4 + Math.random() * 14, 4 + Math.random() * 14);
  }

  const vig = ctx.createRadialGradient(384, 480, 220, 384, 480, 560);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(38,28,18,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 768, 960);

  if (info.theme === 'calendar' || info.theme === 'sticky') {
    ctx.strokeStyle = 'rgba(110, 92, 70, 0.2)';
    ctx.lineWidth = 2;
    for (let y = 210; y <= 840; y += 54) {
      ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(704, y); ctx.stroke();
    }
    ctx.fillStyle = info.theme === 'sticky' ? '#7a5a1c' : '#8b2b24';
    ctx.fillRect(64, 84, 640, 6);
    ctx.font = 'bold 32px "Be Vietnam Pro", sans-serif';
    ctx.fillText(info.header, 64, 146);
  } else if (info.theme === 'report' || info.theme === 'wet') {
    ctx.fillStyle = 'rgba(42, 52, 62, 0.14)';
    ctx.beginPath(); ctx.arc(570, 680, 98, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(60, 50, 42, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 56, 672, 848);
    ctx.fillStyle = '#25201b';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(info.header, 80, 134);
    ctx.fillRect(80, 156, 608, 3);
  } else if (info.theme === 'certificate') {
    ctx.strokeStyle = 'rgba(40, 36, 32, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(44, 52, 680, 856);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(54, 62, 660, 836);
    ctx.fillStyle = '#1e1a17';
    ctx.font = 'bold 36px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(info.header, 384, 136);
    ctx.font = '23px monospace';
    ctx.fillText(info.subHeader, 384, 180);
    ctx.textAlign = 'left';
    ctx.fillRect(84, 206, 600, 2);
  } else {
    ctx.strokeStyle = 'rgba(48, 56, 64, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 60, 664, 840);
    ctx.fillStyle = info.theme === 'frost' ? '#1c3b4d' : '#4a1b17';
    ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
    ctx.fillText(info.header, 80, 138);
    ctx.fillRect(80, 160, 608, 3);
  }

  ctx.fillStyle = info.theme === 'scrawl' ? '#5e1410' : '#221c16';
  ctx.font = info.theme === 'report'
    ? '31px "Lora", Georgia, serif'
    : 'italic 35px "Lora", Georgia, serif';
  const nextY = wrapCanvasText(ctx, info.body, 80, 250, 608, 54);

  if (info.note) {
    const divY = Math.max(nextY + 34, 540);
    ctx.strokeStyle = 'rgba(70, 58, 46, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, divY); ctx.lineTo(688, divY); ctx.stroke();

    ctx.fillStyle = 'rgba(65, 52, 42, 0.88)';
    ctx.font = 'italic 27px "Lora", Georgia, serif';
    wrapCanvasText(ctx, info.note, 80, divY + 52, 608, 44);
  }

  ctx.fillStyle = 'rgba(55, 45, 36, 0.7)';
  ctx.font = '20px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('[ Nhấn E hoặc Esc để hạ giấy xuống ]', 384, 926);
  ctx.textAlign = 'left';

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Reusable TV static texture system
const tvCanvas = document.createElement('canvas'); tvCanvas.width = 128; tvCanvas.height = 96;
const tvCtx = tvCanvas.getContext('2d');
const tvImgData = tvCtx.createImageData(128, 96);
export const tvStaticTex = new THREE.CanvasTexture(tvCanvas);

export function updateTVStatic() {
  const d = tvImgData.data;
  for (let y = 0; y < 96; y++) {
    const scanDim = (y % 3 === 0) ? 0.68 : 1.0;
    const rowOff = y * 128 * 4;
    for (let x = 0; x < 128; x++) {
      const idx = rowOff + x * 4;
      const v = (Math.random() * 210 + 30) * scanDim;
      d[idx] = v * 0.78;
      d[idx + 1] = v * 0.92;
      d[idx + 2] = v;
      d[idx + 3] = 255;
    }
  }
  tvCtx.putImageData(tvImgData, 0, 0);
  tvStaticTex.needsUpdate = true;
}

// Window rain streaks system
export function createWindowRainSystem() {
  const rainWinCanvas = document.createElement('canvas');
  rainWinCanvas.width = 128; rainWinCanvas.height = 128;
  const rainWinCtx = rainWinCanvas.getContext('2d');
  const rainWinTex = new THREE.CanvasTexture(rainWinCanvas);
  const rainDrops = Array.from({ length: 34 }, () => ({
    x: Math.random() * 128,
    y: Math.random() * 128,
    len: 7 + Math.random() * 14,
    spd: 0.9 + Math.random() * 1.9,
    alpha: 0.25 + Math.random() * 0.45
  }));

  function updateWindowRain(dt, isDawn = false) {
    const ctx = rainWinCtx;
    ctx.fillStyle = isDawn ? '#7e6d56' : '#263a52';
    ctx.fillRect(0, 0, 128, 128);

    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, isDawn ? 'rgba(255, 214, 150, 0.48)' : 'rgba(92, 134, 178, 0.28)');
    g.addColorStop(1, 'rgba(12, 18, 28, 0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);

    ctx.lineWidth = 1.4;
    for (let i = 0; i < rainDrops.length; i++) {
      const d = rainDrops[i];
      d.y += d.spd * dt * 52;
      d.x -= d.spd * dt * 7;
      if (d.y > 134) { d.y = -12; d.x = Math.random() * 136; }
      if (d.x < -8) d.x = 132;
      ctx.strokeStyle = isDawn
        ? `rgba(255, 240, 210, ${d.alpha * 0.7})`
        : `rgba(182, 218, 248, ${d.alpha})`;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 2.2, d.y + d.len);
      ctx.stroke();
      ctx.fillStyle = isDawn ? 'rgba(255,246,225,0.55)' : 'rgba(205,234,255,0.6)';
      ctx.fillRect(d.x - 2.6, d.y + d.len, 1.8, 2.2);
    }
    rainWinTex.needsUpdate = true;
  }

  updateWindowRain(0.016, false);
  return { rainWinTex, updateWindowRain };
}
```
