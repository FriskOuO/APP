# 🎮 期末專案報告 - Part 5: 程式碼功能說明

## 💻 程式碼各區段功能詳細說明

---

## 📂 區段 1: 狀態機系統 (visualNovelMachine.js)

### 檔案位置
[src/visualNovelMachine.js](src/visualNovelMachine.js)

### 功能概述
使用 XState v5 實現的有限狀態機，管理整個遊戲的狀態流轉和業務邏輯。

---

### 1.1 狀態機定義

#### 基本結構
```javascript
export const visualNovelMachine = createMachine({
  id: 'visualNovel',
  initial: 'start',
  
  context: {
    // 遊戲數據
    currentText: '',
    distance: 500,
    qteSequence: [],
    qteProgress: 0,
    failCount: 0,
    
    // 二周目系統
    gameCleared: false,
    isAutoPilot: false,
    
    // 停車計費
    email: '',
    parkedHours: 0,
    
    // 系統數據
    logs: [],
    backgroundImage: 'parking-lot'
  },
  
  states: {
    // 15+ 遊戲狀態定義
  }
});
```

**功能說明**:
- `id`: 狀態機唯一識別碼
- `initial`: 初始狀態（遊戲開始時的狀態）
- `context`: 狀態機的上下文數據（相當於 Redux 的 store）
- `states`: 所有可能的遊戲狀態

---

### 1.2 QTE 序列生成

```javascript
/**
 * 生成隨機的 QTE 鍵盤序列
 * @returns {string[]} 4個隨機方向鍵的陣列
 */
const generateQTESequence = () => {
  const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  const sequence = [];
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * arrows.length);
    sequence.push(arrows[randomIndex]);
  }
  
  return sequence;
};

/**
 * 將鍵盤代碼轉換為箭頭符號
 * @param {string} key - 鍵盤代碼 (e.g., 'ArrowUp')
 * @returns {string} 箭頭符號 (e.g., '👆')
 */
export const getArrowSymbol = (key) => {
  const symbols = { 
    'ArrowUp': '👆', 
    'ArrowDown': '👇', 
    'ArrowLeft': '👈', 
    'ArrowRight': '👉' 
  };
  return symbols[key] || key;
};
```

**實作原理**:
1. 定義4個方向鍵選項
2. 使用 `Math.random()` 生成隨機索引
3. 循環4次，每次隨機選擇一個方向
4. 返回包含4個隨機方向的陣列

**使用時機**:
- 進入 `qteSequence` 狀態時自動生成
- 每次 QTE 失敗重試時重新生成

---

### 1.3 NTP 時間同步服務

```javascript
invoke: {
  // 使用 fromPromise 創建異步服務
  src: fromPromise(async () => {
    try {
      const t0 = Date.now();  // 記錄請求發送時間
      
      // 檢測運行環境
      const isNative = typeof navigator !== 'undefined' 
        && navigator.product === 'ReactNative';
      
      // 移動端或開發環境跳過 NTP 同步
      if (isNative || process.env.NODE_ENV === 'development') {
        console.log('⏰ Using local time (NTP sync disabled)');
        return {
          serverTime: Date.now(),
          t1: Date.now(),
          t2: Date.now(),
          t3: Date.now(),
          stratum: 16  // 表示未同步
        };
      }
      
      // Web 環境：呼叫後端 NTP API
      const res = await fetch(`/api/ntp?t0=${t0}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // 驗證回應格式
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error('NTP Sync Failed: Invalid Response');
      }

      return res.json();
      
    } catch (err) {
      console.error('NTP Fetch Error:', err);
      // Fallback: 使用本地時間
      return {
        serverTime: Date.now(),
        stratum: 16
      };
    }
  }),
  
  // 成功處理
  onDone: {
    actions: assign({
      currentText: ({ context, event }) => {
        const { serverTime, stratum } = event.output;
        
        if (stratum === 16) {
          // 使用本地時間
          return `系統就緒 (使用本地時間)\n當前時間: ${new Date(serverTime).toLocaleString()}`;
        }
        
        // NTP 同步成功
        return `✅ NTP 同步完成\n伺服器時間: ${new Date(serverTime).toLocaleString()}`;
      },
      
      logs: ({ context, event }) => {
        const { t1, t2, t3, stratum, serverTime } = event.output;
        const t4 = Date.now();
        
        // 計算時間偏移量
        const offset = ((t2 - t1) + (t3 - t4)) / 2;
        
        return [...context.logs, { 
          type: 'success', 
          text: `⏰ NTP Sync: Stratum ${stratum}, Offset ${offset.toFixed(2)}ms`, 
          timestamp: serverTime 
        }];
      }
    })
  }
}
```

**NTP 協議說明**:
1. **t0**: 客戶端發送請求時間
2. **t1**: 伺服器接收請求時間
3. **t2**: 伺服器發送回應時間
4. **t3**: 客戶端接收回應時間
5. **offset**: 時間偏移量 = ((t2 - t1) + (t3 - t4)) / 2
6. **stratum**: NTP 層級（0-15 為有效層級，16 表示未同步）

---

### 1.4 狀態轉換與動作

#### inCar 狀態（車內場景）
```javascript
inCar: {
  // 進入狀態時執行
  entry: assign({
    currentText: ({ context }) => {
      if (context.gameCleared) {
        // 二周目文本
        return '[車載智能]: 歡迎回來，VIP 用戶！\n' +
               '您已解鎖自動駕駛模式。\n\n' +
               '請選擇駕駛模式：';
      }
      // 一周目文本
      return '[車載智能]: 歡迎上車！準備啟動引擎。\n' +
             '[車載智能]: 這次我們使用 QTE 挑戰來啟動。';
    },
    backgroundImage: 'car-interior',
    logs: ({ context }) => [
      ...context.logs, 
      { 
        type: 'action', 
        text: '🚗 進入車內', 
        timestamp: new Date().toISOString() 
      }
    ]
  }),
  
  // 監聽事件
  on: {
    START_ENGINE: {
      target: 'qteSequence',
      actions: assign({
        // 生成新的 QTE 序列
        qteSequence: () => generateQTESequence(),
        qteProgress: 0,
        logs: ({ context }) => [
          ...context.logs,
          { 
            type: 'qte', 
            text: '🎯 QTE Challenge: Started', 
            timestamp: new Date().toISOString() 
          }
        ]
      })
    },
    
    // 二周目：自動駕駛選項
    AUTO_PILOT: {
      target: 'driving',
      guard: ({ context }) => context.gameCleared,  // 僅二周目可用
      actions: assign({
        isAutoPilot: true,
        logs: ({ context }) => [
          ...context.logs,
          { 
            type: 'system', 
            text: '💎 Auto Pilot: Activated', 
            timestamp: new Date().toISOString() 
          }
        ]
      })
    },
    
    EXIT_CAR: {
      target: 'start'
    }
  }
}
```

**entry 動作**:
- 每次進入狀態時自動執行
- 使用 `assign` 更新 context 數據
- 可以添加日誌、更新背景圖等

**on 事件**:
- 定義該狀態下可以接收的事件
- `target`: 轉換到的目標狀態
- `actions`: 轉換時執行的動作
- `guard`: 條件守衛，返回 true 才允許轉換

---

### 1.5 距離模擬服務

```javascript
driving: {
  // 啟動距離模擬服務
  invoke: {
    src: fromCallback(({ sendBack, receive }) => {
      // 每 50ms 更新一次距離
      const interval = setInterval(() => {
        sendBack({ 
          type: 'UPDATE_DISTANCE', 
          delta: -10  // 每次減少 10cm
        });
      }, 50);

      // 清理函數
      return () => clearInterval(interval);
    })
  },
  
  on: {
    UPDATE_DISTANCE: {
      // 更新距離但不轉換狀態
      actions: assign({
        distance: ({ context, event }) => {
          const newDistance = context.distance + event.delta;
          
          // 限制最小值為 0
          return Math.max(newDistance, 0);
        },
        logs: ({ context, event }) => {
          const newDistance = Math.max(context.distance + event.delta, 0);
          
          // 每 50cm 記錄一次
          if (newDistance % 50 === 0) {
            return [
              ...context.logs,
              { 
                type: 'sensor', 
                text: `📏 Distance: ${newDistance}cm`, 
                timestamp: new Date().toISOString() 
              }
            ];
          }
          return context.logs;
        }
      }),
      
      // 條件轉換：距離 <= 50cm 時到達閘門
      guard: ({ context }) => context.distance > 50
    },
    
    ARRIVED_AT_GATE: {
      target: 'atGate',
      guard: ({ context }) => context.distance <= 50
    }
  }
}
```

**服務說明**:
- `fromCallback`: 創建可發送事件的服務
- `sendBack`: 向狀態機發送事件
- `interval`: 定時器，模擬連續的距離變化
- 服務會在離開狀態時自動清理

---

### 1.6 郵件通知狀態

```javascript
sendingEmail: {
  invoke: {
    src: fromPromise(async ({ input }) => {
      const { email, parkedHours } = input;
      const fee = parkedHours * 30;  // 每小時 NT$30
      
      // 呼叫後端 API 發送郵件
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: '停車費用通知 - Smart Parking',
          text: `停車時間: ${parkedHours} 小時\n停車費用: NT$ ${fee}`,
          html: `
            <h2>🚗 停車費用通知</h2>
            <p>親愛的用戶：</p>
            <p>停車時間：<strong>${parkedHours} 小時</strong></p>
            <p>停車費用：<strong>NT$ ${fee}</strong></p>
            <p>請於 7 日內完成繳費。</p>
          `
        })
      });
      
      if (!response.ok) {
        throw new Error('Email sending failed');
      }
      
      return await response.json();
    }),
    
    // 傳入參數
    input: ({ context }) => ({
      email: context.email,
      parkedHours: context.parkedHours
    }),
    
    onDone: {
      target: 'finished',
      actions: assign({
        notification: ({ context }) => ({
          title: '繳費通知已發送',
          message: `已發送到 ${context.email}`,
          type: 'success'
        })
      })
    },
    
    onError: {
      target: 'paymentInput',
      actions: assign({
        logs: ({ context, event }) => [
          ...context.logs,
          { 
            type: 'fail', 
            text: `❌ Email Failed: ${event.error.message}`, 
            timestamp: new Date().toISOString() 
          }
        ]
      })
    }
  }
}
```

**異步處理**:
- `fromPromise`: 創建基於 Promise 的服務
- `input`: 從 context 提取需要的參數
- `onDone`: Promise resolve 時的處理
- `onError`: Promise reject 時的處理

---

## 📂 區段 2: 主應用組件 (App.js)

### 檔案位置
[src/App.js](src/App.js)

### 功能概述
應用程式的根組件，整合所有子組件並處理遊戲邏輯。

---

### 2.1 狀態機整合

```javascript
import { useMachine } from '@xstate/react';
import { visualNovelMachine } from './visualNovelMachine';

function App() {
  // 連接狀態機
  const [state, send] = useMachine(visualNovelMachine);
  
  // 提取當前狀態和上下文
  const currentState = state.value;
  const context = state.context;
  
  // 解構常用數據
  const { 
    distance, 
    logs, 
    qteSequence, 
    qteProgress,
    gameCleared 
  } = context;
  
  // 檢查是否在特定狀態
  const isQTEActive = currentState === 'qteSequence';
  const isDriving = currentState === 'driving';
  const isParked = currentState === 'parked';
  
  return (
    <div className="app-container">
      {/* 根據狀態渲染不同的 UI */}
    </div>
  );
}
```

**狀態機 Hook 說明**:
- `useMachine`: XState 提供的 React Hook
- `state`: 當前狀態對象
- `send`: 發送事件的函數
- `state.value`: 當前狀態名稱
- `state.context`: 狀態機的上下文數據

---

### 2.2 打字機文字組件

```javascript
/**
 * 打字機效果文字組件
 * 逐字顯示文本，支持變數替換和多色文本
 */
const TypewriterText = ({ 
  text,              // 要顯示的文本
  context,           // 上下文數據（用於變數替換）
  onComplete,        // 完成時的回調
  forceShowFull,     // 是否立即顯示全部
  isDrivingActive,   // 是否在駕駛中（駕駛時跳過打字機效果）
  onUpdate           // 每次更新時的回調
}) => {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [processedText, setProcessedText] = useState('');
  const scrollRef = useRef(null);

  // 1️⃣ 變數替換
  useEffect(() => {
    if (!text) return;
    
    // 替換 {{variableName}} 格式的變數
    const replaced = text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const value = context[variableName.trim()];
      return value !== undefined ? value : match;
    });
    
    if (replaced !== processedText) {
      setProcessedText(replaced);
      setGlobalIndex(0);  // 重置索引
    }
  }, [text, context, processedText]);

  // 2️⃣ 解析文本段落（支持多色文本）
  const segments = React.useMemo(() => 
    parseTextToSegments(processedText), 
    [processedText]
  );
  
  const totalChars = segments.reduce((acc, seg) => 
    acc + seg.text.length, 0
  );

  // 3️⃣ 打字機計時器
  useEffect(() => {
    if (!processedText) return;

    // 特殊情況：立即顯示全部
    if (forceShowFull || isDrivingActive) {
      setGlobalIndex(totalChars);
      if (onComplete) onComplete();
      return;
    }

    // 逐字顯示
    if (globalIndex < totalChars) {
      const timeout = setTimeout(() => {
        setGlobalIndex(prev => prev + 1);
        if (onUpdate) onUpdate();
      }, 30);  // 每 30ms 顯示一個字元
      return () => clearTimeout(timeout);
    } else {
      // 完成時回調
      if (onComplete) onComplete();
    }
  }, [globalIndex, totalChars, processedText, forceShowFull, isDrivingActive]);

  // 4️⃣ 自動滾動到底部
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalIndex]);

  // 5️⃣ 渲染
  let charCounter = 0;
  
  return (
    <div style={{ whiteSpace: 'pre-wrap', display: 'flex', flexDirection: 'column' }}>
      <div>
        {segments.map((seg, i) => {
          const start = charCounter;
          const end = charCounter + seg.text.length;
          charCounter += seg.text.length;

          // 尚未到達此段落
          if (globalIndex < start) return null;

          // 計算可見文本
          const visibleText = globalIndex >= end 
            ? seg.text 
            : seg.text.slice(0, globalIndex - start);

          return (
            <span key={i} style={{ color: seg.color }}>
              {visibleText}
              {seg.newLine && <br/>}
            </span>
          );
        })}
        {/* 閃爍游標 */}
        {globalIndex < totalChars && <span className="animate-pulse">_</span>}
      </div>
      <div ref={scrollRef} />
    </div>
  );
};
```

**實作細節**:
1. **變數替換**: 支持 `{{variableName}}` 語法
2. **多色文本**: 根據說話者顯示不同顏色
3. **計時控制**: 每 30ms 顯示一個字元
4. **自動滾動**: 確保最新文本可見
5. **跳過選項**: 駕駛時立即顯示完整文本

---

### 2.3 場景文本管理

```javascript
/**
 * 場景文本定義
 * 每個狀態對應一個場景配置
 */
const sceneTexts = {
  start: {
    text: "系統載入中... 正在連接 NTP 伺服器校時...",
    choices: [
      { label: "[進入車內]", event: "NEXT" }
    ],
    backgroundImage: 'protagonist'
  },
  
  inCar: {
    text: ({ gameCleared }) => gameCleared
      ? "[車載智能]: 歡迎回來，VIP！\n選擇您的駕駛模式："
      : "[車載智能]: 歡迎上車！準備啟動引擎。",
    choices: ({ gameCleared }) => [
      { label: "[啟動引擎]", event: "START_ENGINE", color: "#00ff88" },
      ...(gameCleared ? [
        { label: "[自動駕駛]", event: "AUTO_PILOT", color: "#c084fc" }
      ] : []),
      { label: "[退出車輛]", event: "EXIT_CAR", color: "#dc2626" }
    ],
    backgroundImage: 'car-interior'
  },
  
  qteSequence: {
    text: "準備 QTE 挑戰！注意看螢幕上的序列...",
    choices: [],  // QTE 期間無選項
    showQTE: true,  // 顯示 QTE 覆蓋層
    backgroundImage: 'car-interior'
  },
  
  driving: {
    text: ({ distance }) => 
      `[車載智能]: 正在前進...\n` +
      `[系統]: 距離閘門還有 ${distance} cm`,
    choices: [],  // 自動駕駛，無選項
    backgroundImage: 'driving-view'
  },
  
  atGate: {
    text: "[系統]: 已到達閘門。距離: 50cm\n[車載智能]: 正在發送 CoAP 請求開啟閘門...",
    choices: [
      { label: "[開啟閘門]", event: "OPEN_GATE", color: "#00ff88" }
    ],
    backgroundImage: 'gate'
  },
  
  parked: {
    text: ({ parkedHours }) => 
      `[系統]: 恭喜！成功停車！\n` +
      `停車時間: ${parkedHours} 小時\n` +
      `停車費用: NT$ ${parkedHours * 30}`,
    choices: [
      { label: "[輸入郵箱]", event: "INPUT_EMAIL", color: "#05d9e8" }
    ],
    backgroundImage: 'parked'
  },
  
  finished: {
    text: "遊戲結束！感謝遊玩！",
    choices: [
      { label: "[重新開始]", event: "RESTART", color: "#00ff88" },
      { label: "[離開遊戲]", event: "EXIT", color: "#dc2626" }
    ],
    backgroundImage: 'protagonist'
  }
};

/**
 * 獲取當前場景配置
 */
const getCurrentScene = (stateName, context) => {
  const scene = sceneTexts[stateName];
  if (!scene) return null;
  
  return {
    text: typeof scene.text === 'function' 
      ? scene.text(context) 
      : scene.text,
    choices: typeof scene.choices === 'function' 
      ? scene.choices(context) 
      : scene.choices,
    backgroundImage: scene.backgroundImage,
    showQTE: scene.showQTE || false
  };
};
```

**動態內容**:
- 文本和選項可以是函數，根據 context 動態生成
- 支持條件顯示（如二周目的自動駕駛選項）
- 變數插值（如顯示當前距離）

---

### 2.4 選擇按鈕渲染

```javascript
/**
 * 渲染選擇按鈕
 */
const renderChoiceButtons = () => {
  const scene = getCurrentScene(currentState, context);
  if (!scene || scene.choices.length === 0) return null;

  return (
    <div className="choice-buttons-container">
      {scene.choices.map((choice, index) => (
        <button
          key={index}
          className="neon-choice-button"
          style={{
            borderColor: choice.color || '#00ff88',
            color: choice.color || '#00ff88',
            boxShadow: `0 0 20px ${choice.color || '#00ff88'}40`
          }}
          onClick={() => {
            // 發送事件到狀態機
            send({ type: choice.event });
            
            // 記錄用戶操作
            console.log(`User selected: ${choice.label} -> ${choice.event}`);
          }}
        >
          <span className="button-label">{choice.label}</span>
          
          {/* 霓虹燈光暈效果 */}
          <div className="button-glow" />
        </button>
      ))}
    </div>
  );
};
```

**互動處理**:
1. 根據場景動態生成按鈕
2. 點擊時發送對應事件
3. 自定義顏色和樣式
4. 霓虹燈視覺效果

---

## 📂 區段 3: IoT 儀表板 (CyberpunkDashboard.js)

### 檔案位置
[src/components/CyberpunkDashboard.js](src/components/CyberpunkDashboard.js)

### 功能概述
即時顯示系統狀態、感測器數據和協議日誌。

---

### 3.1 狀態標籤映射

```javascript
/**
 * 狀態顯示文本映射
 * 將內部狀態名稱轉換為用戶友好的顯示文本
 */
const stateLabels = {
  // 核心狀態
  'start': '🌐 系統載入',
  'inCar': '🚗 車內待命',
  'qteSequence': '🎮 QTE挑戰中',
  'engineStall': '💀 引擎熄火',
  'driving': '🏎️ 駕駛中',
  'atGate': '🚧 閘門前',
  'gateOpening': '⏳ 閘門開啟中',
  'parked': '✅ 已停車',
  
  // 擴展狀態
  'interactCat': '🐱 遭遇迷因貓',
  'interactSpaghetti': '🍝 義大利麵事件',
  'endingBlackHole': '🌌 結局：黑洞',
  'endingCatChaos': '😵 結局：混亂',
  'finished': '🎉 遊戲結束'
};

/**
 * 獲取狀態顯示文本
 */
const getStateLabel = (stateName) => {
  return stateLabels[stateName] || `❓ ${stateName}`;
};
```

---

### 3.2 動態警示系統

```javascript
/**
 * 根據距離和狀態計算警示等級
 * @param {number} dist - 當前距離 (cm)
 * @param {string} state - 當前狀態
 * @returns {Object} 警示配置對象
 */
const getWarningStatus = (dist, state) => {
  // 特殊狀態處理
  if (state === 'parked') {
    return {
      level: 'completed',
      color: '#05d9e8',
      barColor: 'linear-gradient(90deg, #05d9e8, #00ff88)',
      label: '🎉 已停車',
      glowColor: 'rgba(5, 217, 232, 0.3)',
      animation: 'none'
    };
  }
  
  if (state === 'start') {
    return {
      level: 'loading',
      color: '#05d9e8',
      label: '🌐 系統載入中',
      animation: 'pulse'
    };
  }
  
  if (state === 'inCar' || state === 'qteSequence') {
    return {
      level: 'ready',
      color: '#00ff88',
      label: '🚗 車輛待命',
      animation: 'none'
    };
  }
  
  // 駕駛狀態：根據距離判斷
  if (state === 'driving') {
    if (dist > 300) {
      return {
        level: 'safe',
        color: '#00ff88',
        barColor: 'linear-gradient(90deg, #00ff88, #00ffff)',
        label: '🟢 安全距離',
        glowColor: 'rgba(0, 255, 136, 0.3)',
        animation: 'none'
      };
    } else if (dist > 150) {
      return {
        level: 'caution',
        color: '#facc15',
        barColor: 'linear-gradient(90deg, #facc15, #ff9e00)',
        label: '🟡 接近中 - 注意',
        glowColor: 'rgba(250, 204, 21, 0.3)',
        animation: 'pulse-slow'
      };
    } else if (dist > 80) {
      return {
        level: 'warning',
        color: '#ff9e00',
        barColor: 'linear-gradient(90deg, #ff9e00, #ff006e)',
        label: '🟠 警告 - 減速！',
        glowColor: 'rgba(255, 158, 0, 0.5)',
        animation: 'pulse-medium'
      };
    } else {
      return {
        level: 'danger',
        color: '#dc2626',
        barColor: 'linear-gradient(90deg, #dc2626, #ff006e)',
        label: '🔴 危險！停車！',
        glowColor: 'rgba(220, 38, 38, 0.8)',
        animation: 'pulse-fast'
      };
    }
  }
  
  // 默認狀態
  return {
    level: 'normal',
    color: '#e5e7eb',
    label: '待命',
    animation: 'none'
  };
};
```

**警示級別**:
- **safe** (安全): 300-500cm, 綠色
- **caution** (警戒): 150-300cm, 黃色, 慢速脈衝
- **warning** (警告): 80-150cm, 橙色, 中速脈衝
- **danger** (危險): 0-80cm, 紅色, 快速脈衝

---

### 3.3 感測器視覺化

```javascript
/**
 * HC-SR04 超聲波感測器面板
 */
const SensorPanel = ({ distance, maxDistance, currentState }) => {
  const percentage = Math.min((distance / maxDistance) * 100, 100);
  const warning = getWarningStatus(distance, currentState);

  return (
    <div 
      className="sensor-panel"
      style={{
        borderColor: warning.color,
        boxShadow: `0 0 20px ${warning.glowColor}`
      }}
    >
      <h3 className="sensor-title">
        📡 HC-SR04 超聲波感測器
      </h3>
      
      {/* 距離數值顯示 */}
      <div 
        className="distance-display"
        style={{ color: warning.color }}
      >
        <span className="distance-value">{distance}</span>
        <span className="distance-unit">cm</span>
        <span className="distance-arrow">▼</span>
      </div>
      
      {/* 進度條 */}
      <div className="progress-container">
        <div 
          className="progress-bar"
          style={{
            width: `${percentage}%`,
            background: warning.barColor,
            boxShadow: `0 0 10px ${warning.color}`,
            transition: 'width 0.3s ease-out, background 0.5s ease'
          }}
        />
      </div>
      
      {/* 警示文字 */}
      <div 
        className={`warning-label ${warning.animation}`}
        style={{ color: warning.color }}
      >
        {warning.label}
      </div>
      
      {/* 感測器規格 */}
      <div className="sensor-specs">
        <div className="spec-item">
          <span className="spec-label">最大:</span>
          <span className="spec-value">{maxDistance}cm</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">最小:</span>
          <span className="spec-value">0cm</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">更新:</span>
          <span className="spec-value">50ms</span>
        </div>
      </div>
    </div>
  );
};
```

---

### 3.4 協議日誌系統

```javascript
/**
 * 協議日誌面板
 */
const ProtocolLogs = ({ logs = [] }) => {
  const logEndRef = useRef(null);

  // 自動滾動到最新日誌
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /**
   * 獲取日誌類型對應的圖示
   */
  const getLogIcon = (type) => {
    const icons = {
      'system': '🎮',     // 系統事件
      'mqtt': '📡',       // MQTT 協議
      'coap': '📦',       // CoAP 協議
      'sensor': '📏',     // 感測器數據
      'qte': '🎯',        // QTE 事件
      'action': '✅',     // 玩家動作
      'success': '🎉',    // 成功事件
      'fail': '💀',       // 失敗事件
      'sql': '💾',        // SQL 操作
      'ntp': '⏰'         // NTP 同步
    };
    return icons[type] || '📝';
  };

  /**
   * 獲取日誌類型對應的顏色
   */
  const getLogColor = (type) => {
    const colors = {
      'system': '#05d9e8',
      'mqtt': '#ff006e',
      'coap': '#ff9e00',
      'sensor': '#00ff88',
      'qte': '#facc15',
      'action': '#05d9e8',
      'success': '#00ff88',
      'fail': '#dc2626',
      'sql': '#c084fc',
      'ntp': '#facc15'
    };
    return colors[type] || '#e5e7eb';
  };

  return (
    <div className="protocol-logs">
      <h3 className="logs-title">
        📋 IoT 協議日誌
        <span className="log-count">({logs.length})</span>
      </h3>
      
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="no-logs">等待事件...</div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index} 
              className="log-entry"
              style={{ 
                color: getLogColor(log.type),
                borderLeft: `3px solid ${getLogColor(log.type)}`
              }}
            >
              {/* 時間戳記 */}
              <span className="log-timestamp">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              
              {/* 圖示 */}
              <span className="log-icon">
                {getLogIcon(log.type)}
              </span>
              
              {/* 類型標籤 */}
              <span className="log-type">
                [{log.type.toUpperCase()}]
              </span>
              
              {/* 日誌內容 */}
              <span className="log-text">
                {log.text}
              </span>
            </div>
          ))
        )}
        
        {/* 自動滾動錨點 */}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
```

**日誌格式**:
```javascript
{
  type: 'mqtt',                           // 日誌類型
  text: 'PUBLISH: vehicle/motion/start',  // 日誌內容
  timestamp: '2026-01-08T14:32:15.123Z'   // ISO 時間戳記
}
```

---

## 📂 區段 4: QTE 系統

### 檔案位置
- [src/components/QTEOverlay.js](src/components/QTEOverlay.js)
- [src/hooks/useQTE.js](src/hooks/useQTE.js)

---

### 4.1 QTE Hook 實作

```javascript
/**
 * QTE (Quick Time Event) Hook
 * 處理鍵盤輸入匹配和進度追蹤
 * 
 * @param {string[]} sequence - 預期的按鍵序列
 * @param {function} onSuccess - 成功時的回調
 * @param {function} onFail - 失敗時的回調
 * @param {boolean} isActive - 是否啟用 QTE
 */
export const useQTE = (sequence, onSuccess, onFail, isActive = true) => {
  const [progress, setProgress] = useState(0);
  const [lastKey, setLastKey] = useState(null);

  useEffect(() => {
    if (!isActive || !sequence || sequence.length === 0) return;
    
    // 已完成所有按鍵
    if (progress >= sequence.length) {
      onSuccess?.();
      return;
    }

    const handleKeyDown = (e) => {
      // 防止重複按鍵
      if (e.key === lastKey) return;
      
      const expectedKey = sequence[progress];
      setLastKey(e.key);

      if (e.key === expectedKey) {
        // ✅ 正確按鍵
        const newProgress = progress + 1;
        setProgress(newProgress);
        
        console.log(`✅ QTE Progress: ${newProgress}/${sequence.length}`);
        
        // 檢查是否完成
        if (newProgress === sequence.length) {
          onSuccess?.();
        }
      } else {
        // ❌ 錯誤按鍵
        console.log(`❌ QTE Failed: Expected ${expectedKey}, got ${e.key}`);
        onFail?.();
        
        // 重置進度
        setProgress(0);
      }
    };

    // 監聽鍵盤事件
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sequence, progress, isActive, lastKey, onSuccess, onFail]);

  // 重置 QTE
  const reset = () => {
    setProgress(0);
    setLastKey(null);
  };

  return { 
    progress,      // 當前進度
    isComplete: progress >= sequence.length,  // 是否完成
    reset          // 重置函數
  };
};
```

---

### 4.2 QTE 覆蓋層組件

```javascript
/**
 * QTE 覆蓋層 - 全螢幕挑戰界面
 */
const QTEOverlay = ({ 
  sequence,     // 按鍵序列
  progress,     // 當前進度
  onSuccess,    // 成功回調
  onFail        // 失敗回調
}) => {
  // 使用 QTE Hook
  useQTE(sequence, onSuccess, onFail, true);

  /**
   * 獲取按鍵狀態
   */
  const getKeyState = (index) => {
    if (index < progress) return 'completed';
    if (index === progress) return 'active';
    return 'pending';
  };

  return (
    <div className="qte-overlay">
      {/* 標題 */}
      <h2 className="qte-title">
        🎮 QTE 引擎啟動挑戰
      </h2>
      
      {/* 說明 */}
      <p className="qte-instruction">
        按下正確的方向鍵序列來啟動引擎！
      </p>
      
      {/* 按鍵序列顯示 */}
      <div className="qte-sequence">
        {sequence.map((key, index) => (
          <div 
            key={index}
            className={`qte-key qte-key-${getKeyState(index)}`}
            data-state={getKeyState(index)}
          >
            <span className="key-symbol">
              {getArrowSymbol(key)}
            </span>
            <span className="key-code">
              {key.replace('Arrow', '')}
            </span>
          </div>
        ))}
      </div>
      
      {/* 進度條 */}
      <div className="qte-progress-container">
        <div 
          className="qte-progress-bar"
          style={{
            width: `${(progress / sequence.length) * 100}%`
          }}
        />
        <span className="progress-text">
          {progress} / {sequence.length}
        </span>
      </div>
      
      {/* 當前提示 */}
      {progress < sequence.length && (
        <div className="qte-hint">
          按下 <span className="hint-key">{getArrowSymbol(sequence[progress])}</span> 鍵！
        </div>
      )}
      
      {/* 完成動畫 */}
      {progress === sequence.length && (
        <div className="qte-complete-animation">
          ✅ 挑戰成功！
        </div>
      )}
    </div>
  );
};
```

---

## 📂 區段 5: 後端服務 (server.js)

### 檔案位置
[server/server.js](server/server.js)

### 功能概述
Express 後端伺服器，提供 NTP 時間同步和郵件發送服務。

---

### 5.1 伺服器設定

```javascript
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mDNS = require('multicast-dns');
const ip = require('ip');

const app = express();

// 中間件
app.use(cors());                    // 允許跨域請求
app.use(express.json());            // 解析 JSON 請求體

// 請求日誌中間件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = 3005;
const HOSTNAME = 'meme-parking.local';
```

---

### 5.2 mDNS 服務發現

```javascript
/**
 * mDNS (Multicast DNS) 服務
 * 允許在區域網路中通過 .local 域名訪問伺服器
 */
const mdns = mDNS();

mdns.on('query', (query) => {
  // 檢查是否查詢我們的主機名
  if (query.questions.some(q => q.name === HOSTNAME)) {
    const localIp = ip.address();
    console.log(`mDNS: Responding to query for ${HOSTNAME} -> ${localIp}`);
    
    // 回應 A 記錄
    mdns.respond({
      answers: [{
        name: HOSTNAME,
        type: 'A',
        ttl: 300,              // 生存時間 300 秒
        data: localIp          // 本機 IP 地址
      }]
    });
  }
});

console.log(`mDNS Responder started: ${HOSTNAME} -> ${ip.address()}`);
```

**mDNS 用途**:
- 無需 DNS 伺服器即可使用域名
- 在區域網路中自動發現服務
- 移動裝置可通過 `meme-parking.local` 訪問

---

### 5.3 NTP 時間同步 API

```javascript
/**
 * NTP (Network Time Protocol) 模擬端點
 * 返回伺服器時間和同步資訊
 */
const handleNTP = (req, res) => {
  const now = Date.now();
  
  res.json({
    t1: req.query.t0 || now,   // 客戶端發送時間
    t2: now,                   // 伺服器接收時間
    t3: now,                   // 伺服器發送時間
    stratum: 2,                // NTP 層級（2 表示從一級伺服器同步）
    refId: "GOOG",             // 參考 ID（Google NTP）
    serverTime: new Date(now).toISOString()  // ISO 格式時間
  });
};

// 支援兩種路徑（處理 proxy 去除前綴的情況）
app.get('/api/ntp', handleNTP);
app.get('/ntp', handleNTP);
```

**時間同步原理**:
1. 客戶端記錄 t0（發送請求時間）
2. 伺服器記錄 t1（接收請求時間）和 t2（發送回應時間）
3. 客戶端記錄 t3（接收回應時間）
4. 計算偏移量: offset = ((t2 - t1) + (t3 - t0)) / 2
5. 計算延遲: delay = (t3 - t0) - (t2 - t1)

---

### 5.4 郵件發送服務

```javascript
/**
 * Nodemailer 設定
 * 使用 Gmail SMTP 發送郵件
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,              // Gmail 帳號
    pass: process.env.GMAIL_APP_PASSWORD       // 應用程式密碼（非登入密碼）
  }
});

/**
 * 發送郵件 API
 */
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  // 驗證必填欄位
  if (!to || !subject || !text) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['to', 'subject', 'text']
    });
  }

  // 郵件選項
  const mailOptions = {
    from: process.env.GMAIL_USER,   // 寄件者
    to,                              // 收件者
    subject,                         // 主旨
    text,                            // 純文字內容
    html                             // HTML 內容
  };

  try {
    // 發送郵件
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent: ' + info.response);
    
    res.status(200).json({ 
      message: 'Email sent successfully', 
      info: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});
```

**Gmail 設定步驟**:
1. 啟用兩步驗證
2. 生成應用程式密碼
3. 在 `.env` 中設定：
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

---

### 5.5 健康檢查與錯誤處理

```javascript
/**
 * 健康檢查端點
 */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Meme Parking Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      ntp: '/api/ntp',
      email: '/api/send-email'
    }
  });
});

/**
 * 404 錯誤處理
 */
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    method: req.method,
    path: req.url,
    availableEndpoints: [
      'GET /',
      'GET /api/ntp',
      'POST /api/send-email'
    ]
  });
});

/**
 * 全域錯誤處理
 */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

/**
 * 啟動伺服器
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 mDNS: ${HOSTNAME}`);
  console.log(`🌐 Local IP: ${ip.address()}`);
});
```

---

## 📂 區段 6: 自訂 Hooks

### 6.1 駕駛機制 Hook (useDrivingMechanic.js)

```javascript
/**
 * 手動駕駛機制 Hook
 * 處理 WASD 鍵盤控制和車輛物理
 */
export const useDrivingMechanic = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState(0);  // 角度（度）

  // 鍵盤輸入處理
  useEffect(() => {
    const keysPressed = new Set();

    const handleKeyDown = (e) => {
      keysPressed.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e) => {
      keysPressed.delete(e.key.toLowerCase());
    };

    // 物理更新循環
    const updateInterval = setInterval(() => {
      // 加速/減速
      if (keysPressed.has('w')) {
        setSpeed(prev => Math.min(prev + 2, 60));  // 最高 60 km/h
      } else if (keysPressed.has('s')) {
        setSpeed(prev => Math.max(prev - 2, 0));   // 最低 0 km/h
      } else {
        // 自然減速
        setSpeed(prev => Math.max(prev - 0.5, 0));
      }

      // 轉向
      if (keysPressed.has('a')) {
        setDirection(prev => prev - 3);  // 左轉 3 度
      }
      if (keysPressed.has('d')) {
        setDirection(prev => prev + 3);  // 右轉 3 度
      }
    }, 50);  // 50ms 更新一次

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 位置更新
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (speed > 0) {
        const radians = (direction * Math.PI) / 180;
        
        setPosition(prev => ({
          x: prev.x + Math.cos(radians) * speed * 0.05,
          y: prev.y + Math.sin(radians) * speed * 0.05
        }));
      }
    }, 50);

    return () => clearInterval(moveInterval);
  }, [speed, direction]);

  return {
    position,
    speed,
    direction
  };
};
```

---

## 總結

本文檔詳細說明了專案中各個核心程式碼區段的功能和實作細節，涵蓋：

1. **狀態機系統**: 遊戲邏輯的核心，使用 XState v5
2. **UI 組件**: React 組件的實作和視覺效果
3. **IoT 模擬**: 感測器、協議日誌和即時數據
4. **QTE 系統**: 快速反應事件的完整實作
5. **後端服務**: NTP 同步和郵件發送
6. **自訂 Hooks**: 可重用的邏輯封裝

每個區段都包含完整的程式碼範例、功能說明和實作原理，便於理解和維護。

---

## 📚 相關文檔

- [Part 1: 專案概述](期末專案報告_Part1_專案概述.md)
- [Part 2: 功能架構](期末專案報告_Part2_功能架構.md)
- [Part 3: 功能導覽](期末專案報告_Part3_功能導覽.md)
- [Part 4: 頁面介紹](期末專案報告_Part4_頁面介紹.md)

---

**文檔完成日期**: 2026年1月8日
