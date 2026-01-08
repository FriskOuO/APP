# 🎮 期末專案報告 - Part 2: 平台功能架構

## 📊 平台功能架構圖

### 整體架構概覽

```
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Parking Adventure                       │
│                     (React + React Native)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Web 版本     │    │  Mobile 版本  │    │  後端服務     │
│  (Browser)   │    │ (React Native)│    │  (Express)   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┴────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   XState v5  │
                    │  狀態機核心   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   UI層        │  │  遊戲邏輯層    │  │   IoT模擬層   │
│  (Components) │  │  (Machines)   │  │  (Services)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🏗️ 系統架構層級

### 1. 核心層 (Core Layer)

#### XState 狀態機系統
```
visualNovelMachine (主要狀態機)
├── Context (上下文數據)
│   ├── distance: 距離數據
│   ├── qteSequence: QTE序列
│   ├── logs: 日誌陣列
│   ├── gameCleared: 通關標記
│   └── email: 使用者郵箱
├── States (狀態節點)
│   ├── start (開始)
│   ├── inCar (車內)
│   ├── qteSequence (QTE挑戰)
│   ├── driving (駕駛中)
│   ├── atGate (閘門前)
│   └── parked (已停車)
└── Services (服務)
    ├── distanceSimulationService
    ├── ntpSyncService
    └── emailNotificationService
```

### 2. 展示層 (Presentation Layer)

#### 主要組件架構
```
App.js (根組件)
├── VisualNovelUI (視覺小說界面)
│   ├── SceneDisplay (場景顯示)
│   ├── DialogueBox (對話框)
│   │   └── TypewriterText (打字機效果)
│   ├── ChoiceButtons (選擇按鈕)
│   └── QTEOverlay (QTE覆蓋層)
├── CyberpunkDashboard (賽博龐克儀表板)
│   ├── StatusPanel (狀態面板)
│   ├── SensorGraph (感測器圖表)
│   └── ProtocolLogs (協議日誌)
├── VirtualMobile (虛擬手機)
│   ├── NotificationPanel (通知面板)
│   └── EmailDisplay (郵件顯示)
└── ManualDrivingConsole (手動駕駛控制台)
    ├── DirectionControls (方向控制)
    └── SpeedDisplay (速度顯示)
```

### 3. 邏輯層 (Logic Layer)

#### 自訂 Hooks
```
hooks/
├── useQTE.js
│   └── 處理QTE鍵盤輸入和驗證
├── useDrivingMechanic.js
│   └── 手動駕駛邏輯
├── useUltrasonicSensor.js
│   └── 超聲波感測器模擬
├── useKeyboardSequence.js
│   └── 鍵盤序列檢測
└── useVirtualHardware.js
    └── 虛擬硬體狀態管理
```

### 4. 服務層 (Service Layer)

#### 後端 API 服務
```
server/
└── server.js
    ├── /api/ntp (NTP時間同步)
    ├── /api/send-email (發送郵件)
    └── /api/mqtt-publish (MQTT發布)
```

---

## 🎮 功能模組架構

### 模組 1: 遊戲核心系統

#### 1.1 狀態管理模組
```
功能: 管理遊戲所有狀態和轉換
技術: XState v5
檔案: visualNovelMachine.js
主要功能:
  ├── 狀態定義 (15+ 遊戲狀態)
  ├── 狀態轉換邏輯
  ├── 上下文數據管理
  └── 副作用處理 (entry/exit actions)
```

#### 1.2 場景管理模組
```
功能: 管理遊戲場景和對話內容
檔案: App.js (sceneTexts 物件)
主要功能:
  ├── 場景文本定義
  ├── 對話內容管理
  ├── 角色顯示邏輯
  └── 背景圖片切換
```

#### 1.3 QTE 系統模組
```
功能: 快速反應事件處理
技術: React Hooks + Keyboard Events
檔案: useQTE.js, QTEOverlay.js
主要功能:
  ├── 隨機序列生成
  ├── 鍵盤輸入捕捉
  ├── 即時驗證反饋
  └── 視覺動畫效果
```

### 模組 2: IoT 模擬系統

#### 2.1 感測器模擬模組
```
功能: 模擬 HC-SR04 超聲波感測器
檔案: CyberpunkDashboard.js
主要功能:
  ├── 距離數據生成 (500cm → 0cm)
  ├── 即時數據更新
  ├── 視覺化進度條
  └── 警示系統 (顏色變化)
```

#### 2.2 協議日誌模組
```
功能: 記錄和顯示 IoT 協議通訊
檔案: visualNovelMachine.js (logs context)
支援協議:
  ├── MQTT (訊息佇列遙測傳輸)
  ├── CoAP (受限應用協議)
  ├── HTTP (超文本傳輸協議)
  └── NTP (網路時間協定)
主要功能:
  ├── 日誌收集
  ├── 類型分類 (system/mqtt/coap/sensor)
  ├── 時間戳記
  └── 日誌顯示和過濾
```

#### 2.3 NTP 時間同步模組
```
功能: 模擬網路時間協定同步
檔案: visualNovelMachine.js (ntpSync 狀態)
主要功能:
  ├── 發送 NTP 請求
  ├── 計算網路延遲
  ├── 時間校正
  └── Stratum 層級顯示
```

### 模組 3: 使用者介面系統

#### 3.1 視覺小說 UI 模組
```
功能: 提供視覺小說風格的互動界面
檔案: VisualNovelUI.js, StoryMode.css
主要功能:
  ├── 對話框設計 (黃色邊框)
  ├── 打字機效果 (逐字顯示)
  ├── 選擇按鈕 (分支劇情)
  └── 場景圖片顯示
```

#### 3.2 賽博龐克儀表板模組
```
功能: 即時顯示系統狀態和 IoT 數據
檔案: CyberpunkDashboard.js, CyberpunkUI.css
主要功能:
  ├── 狀態顯示面板
  ├── 距離感測器圖表
  ├── 協議日誌視窗
  ├── 霓虹燈效果
  └── CRT 掃描線效果
```

#### 3.3 虛擬手機模組
```
功能: 模擬移動裝置通知系統
檔案: VirtualMobile.js, VirtualMobile.css
主要功能:
  ├── 通知彈出動畫
  ├── 郵件顯示
  ├── 費用計算
  └── 互動按鈕
```

#### 3.4 QTE 覆蓋層模組
```
功能: 全螢幕 QTE 挑戰界面
檔案: QTEOverlay.js, DrivingQTE.css
主要功能:
  ├── 序列顯示 (↑↓←→)
  ├── 進度指示器
  ├── 成功/失敗動畫
  └── 鍵盤輸入提示
```

### 模組 4: 進階功能系統

#### 4.1 手動駕駛模組
```
功能: 提供手動駕駛控制
檔案: ManualDrivingConsole.js, useDrivingMechanic.js
主要功能:
  ├── 方向鍵控制 (WASD)
  ├── 速度控制
  ├── 碰撞檢測
  └── 位置追蹤
```

#### 4.2 二周目系統模組
```
功能: 通關後解鎖新功能
檔案: visualNovelMachine.js (gameCleared context)
主要功能:
  ├── 通關狀態保存
  ├── 自動駕駛解鎖
  ├── VIP 提示訊息
  └── 跳過 QTE 選項
```

#### 4.3 電子郵件通知模組
```
功能: 發送停車費用通知
檔案: server.js (Nodemailer)
主要功能:
  ├── 郵件信箱驗證
  ├── 費用計算
  ├── 郵件內容生成
  └── SMTP 發送
```

---

## 🔄 資料流架構

### 單向資料流
```
使用者操作 (User Action)
        ↓
事件觸發 (Event Trigger)
        ↓
狀態機處理 (XState Machine)
        ↓
狀態更新 (State Update)
        ↓
上下文變更 (Context Change)
        ↓
UI 重新渲染 (Re-render)
        ↓
視覺反饋 (Visual Feedback)
```

### 狀態機事件流
```
[進入車內] 按鈕
    ↓
ENTER_CAR 事件
    ↓
inCar 狀態
    ↓
[啟動引擎] 按鈕
    ↓
START_ENGINE 事件
    ↓
qteSequence 狀態
    ↓
鍵盤輸入
    ↓
QTE_SUCCESS / QTE_FAILED 事件
    ↓
driving 狀態 / engineStall 狀態
```

---

## 🔌 系統整合架構

### 前後端整合
```
前端 (React)
    │
    ├── HTTP Request → 後端 API (Express)
    │                      │
    │                      ├── NTP 服務
    │                      ├── Email 服務
    │                      └── MQTT 模擬
    │
    └── WebSocket (未來擴充) ← 即時通訊
```

### 跨平台整合
```
共享程式碼 (src/)
    │
    ├── Web 平台
    │   ├── React DOM
    │   ├── Browser APIs
    │   └── PWA 功能
    │
    └── Mobile 平台
        ├── React Native
        ├── Native APIs
        └── Expo 功能
```

---

## 📦 專案檔案結構

```
APP_FINAL/
├── src/                          # 源代碼目錄
│   ├── App.js                    # 主應用組件 (Web)
│   ├── AppNative.js              # 主應用組件 (Native)
│   ├── index.js                  # 入口文件
│   │
│   ├── 狀態機 (State Machines)
│   ├── visualNovelMachine.js     # 視覺小說狀態機 ⭐
│   ├── stateMachine.js           # 停車場狀態機
│   ├── gameMachine.js            # 遊戲狀態機
│   ├── qteGameMachine.js         # QTE 遊戲狀態機
│   └── parkingAdventureMachine.js# 停車冒險狀態機
│   │
│   ├── components/               # UI 組件
│   │   ├── 主要組件
│   │   ├── CyberpunkDashboard.js      # 賽博龐克儀表板 ⭐
│   │   ├── CyberpunkDashboardNative.js# 移動端儀表板
│   │   ├── VisualNovelUI.js           # 視覺小說 UI ⭐
│   │   ├── VirtualMobile.js           # 虛擬手機 ⭐
│   │   ├── ManualDrivingConsole.js    # 手動駕駛控制台
│   │   │
│   │   ├── IoT 相關組件
│   │   ├── IoTDashboard.js            # IoT 儀表板
│   │   ├── IoTDebugPanel.js           # IoT 調試面板
│   │   ├── IoTDebugTerminal.js        # IoT 調試終端
│   │   │
│   │   ├── 遊戲組件
│   │   ├── QTEOverlay.js              # QTE 覆蓋層 ⭐
│   │   ├── QTEGame.js                 # QTE 遊戲
│   │   ├── DrivingQTE.js              # 駕駛 QTE
│   │   ├── GridGame.js                # 網格遊戲
│   │   ├── TextAdventureGame.js       # 文字冒險遊戲
│   │   │
│   │   ├── 通用組件
│   │   ├── HybridUI.js                # 混合 UI
│   │   ├── ActionMenu.js              # 動作選單
│   │   ├── GameTerminal.js            # 遊戲終端
│   │   ├── TextRenderer.js            # 文字渲染器
│   │   │
│   │   └── 樣式文件
│   │       ├── CyberpunkUI.css        # 賽博龐克樣式 ⭐
│   │       ├── StoryMode.css          # 故事模式樣式
│   │       ├── DrivingQTE.css         # 駕駛 QTE 樣式
│   │       ├── IoTDebugPanel.css      # IoT 面板樣式
│   │       ├── IoTDebugTerminal.css   # IoT 終端樣式
│   │       ├── VirtualMobile.css      # 虛擬手機樣式 ⭐
│   │       ├── VisualNovel.css        # 視覺小說樣式
│   │       └── GridGame.css           # 網格遊戲樣式
│   │
│   └── hooks/                    # 自訂 Hooks
│       ├── useQTE.js             # QTE Hook ⭐
│       ├── useDrivingMechanic.js # 駕駛機制 Hook
│       ├── useUltrasonicSensor.js# 超聲波感測器 Hook
│       ├── useKeyboardSequence.js# 鍵盤序列 Hook
│       └── useVirtualHardware.js # 虛擬硬體 Hook
│
├── server/                       # 後端服務
│   └── server.js                 # Express 伺服器 ⭐
│
├── public/                       # 靜態資源
│   ├── index.html                # HTML 模板
│   ├── manifest.json             # PWA 配置
│   └── assets/                   # 圖片資源
│
├── 配置文件
├── package.json                  # 依賴配置
├── metro.config.js               # Metro 打包配置
├── eas.json                      # Expo 建構配置
├── eslint.config.js              # ESLint 配置
└── postcss.config.js             # PostCSS 配置
```

⭐ = 核心重要文件

---

## 🎯 功能分層總結

### Layer 1: 基礎設施層
- **React 框架**: UI 渲染引擎
- **XState**: 狀態管理核心
- **Express**: 後端服務
- **React Native**: 移動端支援

### Layer 2: 核心業務層
- **狀態機邏輯**: 遊戲流程控制
- **IoT 模擬**: 協議和感測器
- **事件處理**: 使用者互動

### Layer 3: 展示層
- **UI 組件**: 視覺呈現
- **動畫效果**: 使用者體驗
- **響應式設計**: 多裝置適配

### Layer 4: 擴展層
- **二周目系統**: 額外內容
- **手動駕駛**: 進階玩法
- **郵件通知**: 外部整合

---

**下一部分**: [Part 3: 功能畫面導覽](期末專案報告_Part3_功能導覽.md)
