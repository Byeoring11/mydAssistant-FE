import { type WebSocketMessage } from "../types/WebSocketType";

export class WebSocketService {
    private websocket: WebSocket | null = null;
    private static instance: WebSocketService;
  
    private constructor() {}
  
    public static getInstance(): WebSocketService {
      if (!WebSocketService.instance) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance;
    }
  
    public async connect(url: string): Promise<void> {
      return new Promise((resolve, reject) => {
        this.websocket = new WebSocket(url);
  
        this.websocket.onopen = () => {
          console.log("WebSocket 연결 성공");
          resolve();
        };
  
        this.websocket.onerror = (error) => {
          console.error("WebSocket 연결 실패", error);
          reject(error);
        };

        this.websocket.onclose = () => {
          console.log("WebSocket 연결 종료");
          resolve();
        };
      });
    }
  
    public send(message: { action: string, serverType: number, cusnoList: string[] | null }): void {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify(message));
      } else {
        throw new Error("WebSocket is not connected");
      }
    }
  
    public onMessage(callback: (msg: WebSocketMessage) => void): void {
      if (this.websocket) {
        this.websocket.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          console.log(msg);
          callback(msg);
        };
      }
    }
  
    public async close(): Promise<void> {
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
    }
  }