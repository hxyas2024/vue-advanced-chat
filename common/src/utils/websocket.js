class WebSocketService {
  constructor(config = {}) {
    // 默认配置
    this.defaultConfig = {
      url: '',
      protocols: [],
      autoReconnect: true,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      maxReconnectAttempts: 0, // 0表示无限重试
      pingInterval: 30000,
      pingMessage: 'ping',
      timeout: 10000
    }

    this.config = { ...this.defaultConfig, ...config }
    this.ws = null
    this.reconnectTimer = null
    this.pingTimer = null
    this.timeoutTimer = null
    this.reconnectAttempts = 0
    this.isManualClose = false
    this.isConnected = false
    this.readyState = 3 // CLOSED

    // 拦截器
    this.interceptors = {
      request: {
        use: (onOpen, onError) => {
          this.requestInterceptor = { onOpen, onError }
        }
      },
      response: {
        use: (onMessage, onError) => {
          this.responseInterceptor = { onMessage, onError }
        }
      }
    }

    this.connect()
  }

  connect() {
    if (this.ws && this.ws.readyState === 1) {
      console.log('WebSocket 已经连接')
      return
    }

    try {
      this.clearTimers()
      this.isManualClose = false
      this.readyState = 0 // CONNECTING

      this.ws = new WebSocket(this.config.url, this.config.protocols)
      this.setupEventHandlers()

      // 连接超时处理
      this.timeoutTimer = setTimeout(() => {
        if (this.readyState !== 1) {
          console.log('WebSocket 连接超时')
          this.handleReconnect()
        }
      }, this.config.timeout)
    } catch (error) {
      console.error('WebSocket 创建失败:', error)
      this.handleReconnect()
    }
  }

  setupEventHandlers() {
    this.ws.onopen = (event) => {
      console.log('WebSocket 连接成功')
      this.clearTimeout()
      this.isConnected = true
      this.readyState = 1 // OPEN
      this.reconnectAttempts = 0

      // 请求拦截器
      if (this.requestInterceptor && this.requestInterceptor.onOpen) {
        this.requestInterceptor.onOpen(event)
      }

      this.startPing()
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket 连接关闭:', event.code, event.reason)
      this.isConnected = false
      this.readyState = 3 // CLOSED
      this.stopPing()

      if (!this.isManualClose && this.config.autoReconnect) {
        this.handleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)

      if (this.requestInterceptor && this.requestInterceptor.onError) {
        this.requestInterceptor.onError(error)
      }
    }

    this.ws.onmessage = (event) => {
      // 过滤心跳消息
      if (event.data === this.config.pingMessage || event.data === 'pong') {
        return
      }

      try {
        let data = event.data
        // 尝试解析JSON
        try {
          data = JSON.parse(event.data)
        } catch (e) {
          // 不是JSON格式，保持原样
        }

        const message = {
          type: 'message',
          data: data,
          timestamp: Date.now()
        }

        // 响应拦截器
        if (this.responseInterceptor && this.responseInterceptor.onMessage) {
          this.responseInterceptor.onMessage(message)
        }
      } catch (error) {
        console.error('消息处理错误:', error)
        if (this.responseInterceptor && this.responseInterceptor.onError) {
          this.responseInterceptor.onError(error)
        }
      }
    }
  }

  handleReconnect() {
    if (this.isManualClose) return

    const maxAttempts = this.config.maxReconnectAttempts
    if (maxAttempts > 0 && this.reconnectAttempts >= maxAttempts) {
      console.log('达到最大重连次数，停止重连')
      return
    }

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(this.config.reconnectDecay, this.reconnectAttempts),
      this.config.maxReconnectInterval
    )

    console.log(`${delay}ms后尝试第${this.reconnectAttempts + 1}次重连...`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  startPing() {
    this.stopPing()

    this.pingTimer = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === 1) {
        try {
          const pingMsg = typeof this.config.pingMessage === 'function'
            ? this.config.pingMessage()
            : this.config.pingMessage

          this.ws.send(pingMsg)
          console.log('发送心跳消息')
        } catch (error) {
          console.error('发送心跳失败:', error)
        }
      }
    }, this.config.pingInterval)
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  clearTimeout() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
    }
  }

  clearTimers() {
    this.clearTimeout()
    this.stopPing()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  send(data) {
    if (this.isConnected && this.ws && this.ws.readyState === 1) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data)
        this.ws.send(message)
        return true
      } catch (error) {
        console.error('发送消息失败:', error)
        return false
      }
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
      return false
    }
  }

  close(code = 1000, reason = '正常关闭') {
    this.isManualClose = true
    this.clearTimers()

    if (this.ws) {
      this.ws.close(code, reason)
      this.ws = null
    }

    this.isConnected = false
    this.readyState = 3 // CLOSED
  }

  reconnect() {
    console.log('手动重新连接')
    this.reconnectAttempts = 0
    this.close()
    this.isManualClose = false
    this.connect()
  }

  getReadyState() {
    return this.readyState
  }

  getStatus() {
    const states = {
      0: '连接中',
      1: '已连接',
      2: '关闭中',
      3: '已关闭'
    }
    return states[this.readyState] || '未知状态'
  }
}

// 创建实例的工厂函数
function createWebSocket(config) {
  return new WebSocketService(config)
}

export default WebSocketService
export { createWebSocket }
