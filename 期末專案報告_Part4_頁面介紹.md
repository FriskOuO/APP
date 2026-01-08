# 🎮 期末專案報告 - Part 4: 頁面功能介紹

## 📄 主要頁面/View 詳細介紹

---

## 1️⃣ 主應用頁面 (App.js)

### 頁面概述
主應用程式入口，整合視覺小說介面和 IoT 儀表板，提供完整的遊戲體驗。

### 頁面結構
```jsx
<div className="app-container">
  {/* 左側區域 (60%) - 視覺小說 */}
  <div className="visual-novel-section">
    <SceneDisplay />
    <DialogueBox>
      <TypewriterText />
    </DialogueBox>
    <ChoiceButtons />
    {showQTE && <QTEOverlay />}
  </div>

  {/* 右側區域 (40%) - IoT 儀表板 */}
  <div className="iot-dashboard-section">
    <CyberpunkDashboard />
  </div>

  {/* 彈出組件 */}
  <VirtualMobile />
  <ManualDrivingConsole />
</div>
```

### 主要功能

#### ✨ 狀態管理
```javascript
// 使用 XState 管理遊戲狀態
const [state, send] = useMachine(visualNovelMachine);

// 當前狀態
const currentState = state.value;

// 上下文數據
const { 
  distance,      // 距離數據
  logs,          // 協議日誌
  qteSequence,   // QTE 序列
  gameCleared,   // 通關標記
  email          // 使用者郵箱
} = state.context;
```

#### 📝 場景文本定義
```javascript
const sceneTexts = {
  start: {
    text: "系統載入中... 正在連接 NTP 伺服器校時...",
    choices: [],
    backgroundImage: 'protagonist'
  },
  inCar: {
    text: "[車載智能]: 歡迎上車！準備啟動引擎。",
    choices: [
      { label: "[啟動引擎]", event: "START_ENGINE" },
      { label: "[退出車輛]", event: "EXIT_CAR" }
    ],
    backgroundImage: 'car-interior'
  },
  // ... 更多場景
};
```

#### ⌨️ 事件處理
```javascript
// 選擇按鈕點擊
const handleChoice = (eventName) => {
  send({ type: eventName });
};

// 郵件輸入
const handleEmailSubmit = (email) => {
  send({ type: "SEND_EMAIL", email });
};
```

### 響應式設計
- **桌面版**: 60/40 左右分屏
- **平板版**: 上下堆疊
- **手機版**: 單欄顯示，可切換視圖

### 視覺效果
- 賽博龐克色調 (#05d9e8, #00ff88)
- 霓虹燈發光效果
- CRT 掃描線動畫
- 平滑過場動畫

---

## 2️⃣ 賽博龐克儀表板 (CyberpunkDashboard.js)

### 頁面概述
即時顯示系統狀態、感測器數據和 IoT 協議日誌的監控面板。

### 組件結構
```jsx
<div className="cyberpunk-dashboard">
  {/* 頂部：系統狀態 */}
  <StatusPanel 
    currentState={currentState}
    timestamp={timestamp}
  />

  {/* 中間：感測器視覺化 */}
  <SensorPanel 
    distance={distance}
    maxDistance={500}
  />

  {/* 底部：協議日誌 */}
  <ProtocolLogs 
    logs={logs}
    autoScroll={true}
  />
</div>
```

### 主要功能

#### 📊 狀態顯示面板
```javascript
const StatusPanel = ({ currentState, timestamp }) => {
  const stateLabels = {
    'start': '🌐 系統載入',
    'inCar': '🚗 車內待命',
    'qteSequence': '🎮 QTE挑戰中',
    'driving': '🏎️ 駕駛中',
    'atGate': '🚧 閘門前',
    'parked': '✅ 已停車'
  };

  return (
    <div className="status-panel">
      <div className="state-label">
        {stateLabels[currentState]}
      </div>
      <div className="timestamp">
        {new Date(timestamp).toLocaleString()}
      </div>
    </div>
  );
};
```

#### 📡 HC-SR04 感測器面板
```javascript
const SensorPanel = ({ distance, maxDistance }) => {
  // 計算百分比
  const percentage = (distance / maxDistance) * 100;
  
  // 根據距離決定警示等級
  const getWarningLevel = () => {
    if (distance > 300) return 'safe';      // 綠色
    if (distance > 150) return 'caution';   // 黃色
    if (distance > 80) return 'warning';    // 橙色
    return 'danger';                        // 紅色
  };

  return (
    <div className={`sensor-panel ${getWarningLevel()}`}>
      <h3>📡 HC-SR04 超聲波感測器</h3>
      <div className="distance-value">
        {distance} cm ▼
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="warning-text">
        {getWarningLevel() === 'safe' && '🟢 安全距離'}
        {getWarningLevel() === 'caution' && '🟡 接近中'}
        {getWarningLevel() === 'warning' && '🟠 警告！減速'}
        {getWarningLevel() === 'danger' && '🔴 危險！停車'}
      </div>
    </div>
  );
};
```

#### 📋 協議日誌視窗
```javascript
const ProtocolLogs = ({ logs, autoScroll }) => {
  const logEndRef = useRef(null);

  // 自動滾動到底部
  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // 日誌類型圖示
  const getLogIcon = (type) => {
    const icons = {
      'system': '🎮',
      'mqtt': '📡',
      'coap': '📦',
      'sensor': '📏',
      'qte': '🎯',
      'action': '✅',
      'success': '🎉',
      'fail': '💀',
      'ntp': '⏰'
    };
    return icons[type] || '📝';
  };

  // 日誌顏色
  const getLogColor = (type) => {
    const colors = {
      'system': '#05d9e8',
      'mqtt': '#ff006e',
      'coap': '#ff9e00',
      'sensor': '#00ff88',
      'qte': '#facc15',
      'success': '#00ff88',
      'fail': '#dc2626'
    };
    return colors[type] || '#e5e7eb';
  };

  return (
    <div className="protocol-logs">
      <h3>📋 IoT 協議日誌</h3>
      <div className="log-container">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className="log-entry"
            style={{ color: getLogColor(log.type) }}
          >
            <span className="log-time">
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>
            <span className="log-icon">
              {getLogIcon(log.type)}
            </span>
            <span className="log-text">
              {log.text}
            </span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
```

### 視覺特效

#### 霓虹燈邊框
```css
.cyberpunk-dashboard {
  border: 2px solid #00ff88;
  box-shadow: 
    0 0 20px rgba(0, 255, 136, 0.5),
    inset 0 0 20px rgba(0, 255, 136, 0.1);
  animation: neon-glow 2s ease-in-out infinite;
}

@keyframes neon-glow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.5),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(0, 255, 136, 0.8),
      inset 0 0 30px rgba(0, 255, 136, 0.2);
  }
}
```

#### 進度條動畫
```css
.progress-fill {
  transition: width 0.3s ease-out, background-color 0.5s ease;
  background: linear-gradient(90deg, #00ff88, #05d9e8);
  box-shadow: 0 0 10px currentColor;
}

.progress-fill.warning {
  background: linear-gradient(90deg, #ff9e00, #ff006e);
}
```

---

## 3️⃣ 視覺小說 UI (VisualNovelUI.js)

### 頁面概述
提供類似視覺小說遊戲的對話和選擇介面。

### 組件結構
```jsx
<div className="visual-novel-ui">
  {/* 場景背景 */}
  <div className="scene-background">
    <img src={backgroundImage} alt="scene" />
  </div>

  {/* 對話框 */}
  <div className="dialogue-box">
    <TypewriterText 
      text={currentText}
      context={context}
      onComplete={handleTextComplete}
    />
  </div>

  {/* 選擇按鈕 */}
  <div className="choice-buttons">
    {choices.map((choice, index) => (
      <button 
        key={index}
        onClick={() => handleChoice(choice.event)}
        className="choice-button"
      >
        {choice.label}
      </button>
    ))}
  </div>
</div>
```

### 核心功能

#### ⌨️ 打字機文字效果
```javascript
const TypewriterText = ({ 
  text, 
  context, 
  onComplete,
  speed = 30 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 替換變數
  const processedText = text.replace(
    /\{\{([^}]+)\}\}/g, 
    (match, varName) => context[varName.trim()] || match
  );

  // 打字機效果
  useEffect(() => {
    if (currentIndex < processedText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + processedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, processedText, speed, onComplete]);

  return (
    <div className="typewriter-text">
      {displayedText}
      {currentIndex < processedText.length && (
        <span className="cursor">_</span>
      )}
    </div>
  );
};
```

#### 🎨 彩色說話者系統
```javascript
// 根據說話者分配顏色
const getSpeakerColor = (speaker) => {
  const colors = {
    '系統': '#4ade80',
    '車載智能': '#22d3ee',
    '主角': '#facc15',
    '神秘人': '#c084fc',
    '動作': '#9ca3af'
  };
  
  for (const [key, color] of Object.entries(colors)) {
    if (speaker.includes(key)) return color;
  }
  return '#e5e7eb';
};

// 解析並著色文本
const parseTextSegments = (text) => {
  const lines = text.split('\n');
  const segments = [];
  
  lines.forEach(line => {
    const match = line.match(/^(\[[^\]]+\]):\s*(.*)/);
    if (match) {
      const [, speaker, content] = match;
      segments.push({
        text: `${speaker}: `,
        color: getSpeakerColor(speaker)
      });
      segments.push({
        text: content,
        color: '#e5e7eb'
      });
    }
  });
  
  return segments;
};
```

#### 🎯 選擇按鈕系統
```javascript
const ChoiceButton = ({ 
  label, 
  onClick, 
  color = '#00ff88' 
}) => {
  return (
    <button
      className="choice-button"
      onClick={onClick}
      style={{
        borderColor: color,
        color: color,
        boxShadow: `0 0 20px ${color}40`
      }}
    >
      <span className="button-text">{label}</span>
      <div className="button-glow" />
    </button>
  );
};
```

### 樣式設計

#### 對話框樣式
```css
.dialogue-box {
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid #facc15;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 
    0 0 30px rgba(250, 204, 21, 0.3),
    inset 0 0 20px rgba(250, 204, 21, 0.1);
  font-family: 'Courier New', monospace;
  font-size: 18px;
  line-height: 1.8;
  color: #e5e7eb;
}

/* 打字機游標 */
.cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

---

## 4️⃣ QTE 覆蓋層 (QTEOverlay.js)

### 頁面概述
全螢幕 QTE（Quick Time Event）挑戰界面，用於引擎啟動序列。

### 組件結構
```jsx
<div className="qte-overlay">
  {/* 標題 */}
  <h2>🎮 QTE 引擎啟動挑戰</h2>
  
  {/* 說明 */}
  <p>按下正確的方向鍵序列來啟動引擎！</p>
  
  {/* 序列顯示 */}
  <div className="qte-sequence">
    {qteSequence.map((key, index) => (
      <div 
        key={index}
        className={`qte-key ${getKeyState(index)}`}
      >
        {getArrowSymbol(key)}
      </div>
    ))}
  </div>
  
  {/* 進度條 */}
  <div className="qte-progress">
    <div 
      className="progress-bar"
      style={{ width: `${(qteProgress / qteSequence.length) * 100}%` }}
    />
  </div>
  
  {/* 提示 */}
  <div className="qte-hint">
    {getHintText()}
  </div>
</div>
```

### 核心邏輯

#### 🎮 QTE Hook
```javascript
// hooks/useQTE.js
export const useQTE = (sequence, onSuccess, onFail) => {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || progress >= sequence.length) return;

    const handleKeyDown = (e) => {
      const expectedKey = sequence[progress];
      
      if (e.key === expectedKey) {
        // 正確按鍵
        setProgress(prev => prev + 1);
        
        // 檢查是否完成
        if (progress + 1 === sequence.length) {
          setIsActive(false);
          onSuccess?.();
        }
      } else {
        // 錯誤按鍵
        setIsActive(false);
        setProgress(0);
        onFail?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, progress, sequence, onSuccess, onFail]);

  const start = () => {
    setProgress(0);
    setIsActive(true);
  };

  return { progress, isActive, start };
};
```

#### 🎯 按鍵狀態視覺化
```javascript
const getKeyState = (index) => {
  if (index < qteProgress) {
    return 'completed';  // 已完成 - 綠色
  } else if (index === qteProgress) {
    return 'active';     // 當前 - 黃色閃爍
  } else {
    return 'pending';    // 未到達 - 灰色
  }
};

const getArrowSymbol = (key) => {
  const symbols = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→'
  };
  return symbols[key] || key;
};
```

### 視覺動畫

#### 按鍵狀態樣式
```css
/* 待按鍵 */
.qte-key.pending {
  background: rgba(156, 163, 175, 0.3);
  color: #9ca3af;
  border: 2px solid #6b7280;
}

/* 當前按鍵 */
.qte-key.active {
  background: rgba(250, 204, 21, 0.5);
  color: #facc15;
  border: 3px solid #facc15;
  box-shadow: 0 0 30px rgba(250, 204, 21, 0.8);
  animation: pulse 0.5s ease-in-out infinite;
  transform: scale(1.2);
}

/* 已完成按鍵 */
.qte-key.completed {
  background: rgba(0, 255, 136, 0.5);
  color: #00ff88;
  border: 2px solid #00ff88;
  animation: shrink 0.3s ease-out forwards;
}

@keyframes pulse {
  0%, 100% { transform: scale(1.2); }
  50% { transform: scale(1.3); }
}

@keyframes shrink {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.6; }
}
```

---

## 5️⃣ 虛擬手機 (VirtualMobile.js)

### 頁面概述
模擬移動裝置的通知系統，顯示郵件和付款資訊。

### 組件結構
```jsx
<div className={`virtual-mobile ${isVisible ? 'show' : ''}`}>
  {/* 手機外殼 */}
  <div className="phone-frame">
    {/* 狀態欄 */}
    <div className="status-bar">
      <span>📶 5G</span>
      <span>{currentTime}</span>
      <span>🔋 95%</span>
    </div>

    {/* 通知區域 */}
    <div className="notification-area">
      <div className="notification-card">
        <div className="notification-header">
          <span className="app-icon">📧</span>
          <span className="app-name">郵件</span>
          <span className="time">剛剛</span>
        </div>
        
        <div className="notification-body">
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
        
        <div className="notification-actions">
          <button onClick={handlePay}>立即繳費</button>
          <button onClick={handleDismiss}>稍後提醒</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 核心功能

#### 📱 通知管理
```javascript
const VirtualMobile = ({ notification, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 顯示通知動畫
  useEffect(() => {
    if (notification) {
      // 延遲顯示，產生滑入效果
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  const handleAction = (action) => {
    // 滑出動畫
    setIsVisible(false);
    
    // 通知父組件
    setTimeout(() => {
      onAction?.(action);
    }, 300);
  };

  return (
    <div className={`virtual-mobile ${isVisible ? 'slide-in' : 'slide-out'}`}>
      {/* ... */}
    </div>
  );
};
```

#### 💰 費用計算
```javascript
const calculateParkingFee = (hours) => {
  const baseRate = 30;  // 每小時 NT$30
  const fee = hours * baseRate;
  
  return {
    hours,
    fee,
    formattedFee: `NT$ ${fee}`,
    description: `停車時間: ${hours} 小時\n費用: NT$ ${fee}`
  };
};
```

### 動畫效果

#### 滑入/滑出動畫
```css
.virtual-mobile {
  position: fixed;
  bottom: -100%;
  right: 20px;
  transition: bottom 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.virtual-mobile.slide-in {
  bottom: 20px;
}

.virtual-mobile.slide-out {
  bottom: -100%;
}

/* 通知卡片脈衝 */
.notification-card {
  animation: notification-pulse 2s ease-in-out infinite;
}

@keyframes notification-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(5, 217, 232, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(5, 217, 232, 0.8);
  }
}
```

---

## 6️⃣ 手動駕駛控制台 (ManualDrivingConsole.js)

### 頁面概述
（進階功能）提供 WASD 鍵盤控制的手動駕駛模式。

### 組件結構
```jsx
<div className="driving-console">
  {/* 速度表 */}
  <div className="speedometer">
    <div className="speed-value">{speed}</div>
    <div className="speed-unit">km/h</div>
  </div>

  {/* 方向指示器 */}
  <div className="direction-pad">
    <button className="dir-up">↑</button>
    <div className="dir-middle">
      <button className="dir-left">←</button>
      <button className="dir-right">→</button>
    </div>
    <button className="dir-down">↓</button>
  </div>

  {/* 位置顯示 */}
  <div className="position-display">
    <span>X: {position.x}</span>
    <span>Y: {position.y}</span>
  </div>
</div>
```

### 駕駛機制
```javascript
// hooks/useDrivingMechanic.js
export const useDrivingMechanic = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'w':
        case 'W':
          // 加速
          setSpeed(prev => Math.min(prev + 5, 60));
          break;
        case 's':
        case 'S':
          // 減速
          setSpeed(prev => Math.max(prev - 5, 0));
          break;
        case 'a':
        case 'A':
          // 左轉
          setDirection(prev => prev - 15);
          break;
        case 'd':
        case 'D':
          // 右轉
          setDirection(prev => prev + 15);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 更新位置
  useEffect(() => {
    const interval = setInterval(() => {
      if (speed > 0) {
        setPosition(prev => ({
          x: prev.x + Math.cos(direction * Math.PI / 180) * speed * 0.1,
          y: prev.y + Math.sin(direction * Math.PI / 180) * speed * 0.1
        }));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [speed, direction]);

  return { position, speed, direction };
};
```

---

## 📱 移動端適配 (AppNative.js & CyberpunkDashboardNative.js)

### 平台差異處理
```javascript
import { Platform } from 'react-native';

// 檢測平台
const isWeb = Platform.OS === 'web';
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// 條件渲染
{isWeb ? (
  <CyberpunkDashboard {...props} />
) : (
  <CyberpunkDashboardNative {...props} />
)}
```

### Native 特有功能
- 觸控手勢支援
- 原生動畫（React Native Animated）
- 推播通知
- 本地儲存（AsyncStorage）

---

## 總結

以上介紹了專案中所有主要的頁面和 View 組件，每個組件都有其特定的功能和視覺設計。這些組件協同工作，提供了完整的遊戲體驗和 IoT 系統模擬。

---

## 📊 頁面統整對照表

### ✅ View 組件一覽（實際顯示的頁面/介面）

| 序號 | View 名稱 | 頁面概述 | 對應檔案 | 類型 |
|-----|---------|---------|---------|------|
| 1 | **主應用頁面** | 應用程式根組件，整合所有子組件 | `src/App.js` | 主 View |
| 2 | **賽博龐克儀表板** | IoT 監控面板，顯示系統狀態和數據 | `src/components/CyberpunkDashboard.js` | 子 View |
| 3 | **視覺小說 UI** | 對話和選擇介面 | `src/components/VisualNovelUI.js` | 子 View |
| 4 | **QTE 覆蓋層** | 全螢幕快速反應挑戰界面 | `src/components/QTEOverlay.js` | 浮動 View |
| 5 | **虛擬手機** | 模擬移動裝置通知系統 | `src/components/VirtualMobile.js` | 浮動 View |
| 6 | **手動駕駛控制台** | WASD 鍵盤控制的駕駛模式 | `src/components/ManualDrivingConsole.js` | 功能 View |
| 7 | **移動端儀表板** | 原生移動端適配版本 | `src/components/CyberpunkDashboardNative.js` | 子 View (Native) |
| 8 | **移動端應用** | React Native 主應用 | `src/AppNative.js` | 主 View (Native) |

> **註**: 共 **8 個 View 組件**，包含 2 個主 View（Web + Native）、3 個子 View、2 個浮動 View、1 個功能 View

---

### 🔧 輔助工具對照表（非 View，支援 View 運作）

#### Hook 工具（邏輯層）

| Hook 名稱 | 功能說明 | 對應檔案 | 類型 |
|----------|---------|---------|------|
| **useQTE** | QTE 鍵盤輸入處理 | `src/hooks/useQTE.js` | 邏輯工具 ⚙️ |
| **useDrivingMechanic** | 手動駕駛機制 | `src/hooks/useDrivingMechanic.js` | 邏輯工具 ⚙️ |
| **useUltrasonicSensor** | 超聲波感測器模擬 | `src/hooks/useUltrasonicSensor.js` | 邏輯工具 ⚙️ |
| **useKeyboardSequence** | 鍵盤序列檢測 | `src/hooks/useKeyboardSequence.js` | 邏輯工具 ⚙️ |
| **useVirtualHardware** | 虛擬硬體狀態管理 | `src/hooks/useVirtualHardware.js` | 邏輯工具 ⚙️ |

#### 樣式檔案（視覺層）

| 樣式檔案 | 應用範圍 | 類型 |
|---------|---------|------|
| `src/components/CyberpunkUI.css` | 賽博龐克風格組件 | 樣式檔案 🎨 |
| `src/components/StoryMode.css` | 視覺小說介面 | 樣式檔案 🎨 |
| `src/components/DrivingQTE.css` | QTE 挑戰界面 | 樣式檔案 🎨 |
| `src/components/VirtualMobile.css` | 虛擬手機 | 樣式檔案 🎨 |
| `src/components/IoTDebugPanel.css` | IoT 調試面板 | 樣式檔案 🎨 |
| `src/components/VisualNovel.css` | 視覺小說通用樣式 | 樣式檔案 🎨 |

---

### 📐 View 架構層次圖

```
【主 View - Web】
App.js 
├── VisualNovelUI.js (子 View - 左側 60%)
│   ├── TypewriterText (打字機組件)
│   ├── ChoiceButtons (選擇按鈕組件)
│   └── QTEOverlay.js (浮動 View - QTE 挑戰)
│
├── CyberpunkDashboard.js (子 View - 右側 40%)
│   ├── StatusPanel (狀態面板組件)
│   ├── SensorPanel (感測器面板組件)
│   └── ProtocolLogs (協議日誌組件)
│
├── VirtualMobile.js (浮動 View - 通知)
└── ManualDrivingConsole.js (功能 View - 手動駕駛)

【主 View - Native】
AppNative.js 
└── CyberpunkDashboardNative.js (子 View - 原生版)
```

### 📊 統計摘要

| 項目 | 數量 | 說明 |
|-----|------|------|
| **View 組件** | 8 個 | 實際顯示的頁面/介面 📱 |
| **Hook 工具** | 5 個 | 邏輯處理工具 ⚙️ |
| **樣式檔案** | 6 個 | CSS 樣式檔案 🎨 |
| **主 View** | 2 個 | App.js (Web) + AppNative.js (Native) |
| **子 View** | 3 個 | VisualNovelUI + CyberpunkDashboard + Native版 |
| **浮動 View** | 2 個 | QTEOverlay + VirtualMobile |
| **功能 View** | 1 個 | ManualDrivingConsole |

---

### 🔍 View vs 非 View 快速識別

**✅ 是 View 的特徵**:
- 返回 JSX/TSX 元素
- 有視覺呈現
- 使用者可以看到和互動
- 通常包含 className 和樣式

**❌ 不是 View 的特徵**:
- Hook (use 開頭) → 邏輯工具 ⚙️
- CSS 檔案 → 樣式檔案 🎨
- 純函數/工具函數 → 工具函數 🔧
- 狀態機 (Machine) → 狀態管理 🤖

---

### 快速查找索引

**想了解遊戲流程？** → 查看 [Part 3: 功能導覽](期末專案報告_Part3_功能導覽.md)

**想理解程式碼？** → 查看 [Part 5: 程式碼說明](期末專案報告_Part5_程式碼說明.md)

**想知道技術架構？** → 查看 [Part 2: 功能架構](期末專案報告_Part2_功能架構.md)

---

**下一部分**: [Part 5: 程式碼功能說明](期末專案報告_Part5_程式碼說明.md)
