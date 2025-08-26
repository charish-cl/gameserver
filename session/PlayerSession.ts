import {WebSocketServer} from "ws";

/**
 * 玩家会话类（封装客户端连接）
 */
export class PlayerSession {
    public playerId: string;
    public socket: WebSocketServer;
    public nickname: string = "Guest";
    public loginTime: number = Date.now();

    // 玩家状态存储
    private state: Record<string, any> = {};

    constructor(socket: WebSocketServer) {
        this.socket = socket;
        this.playerId = socket;
    }

    setState(key: string, value: any) {
        this.state[key] = value;
    }

    getState(key: string, defaultValue?: any) {
        return key in this.state ? this.state[key] : defaultValue;
    }

    // 向该玩家发送消息
    sendMessage(event: string, payload: any) {
        this.socket.emit(event, payload);
    }

    // 广播给其他玩家
    broadcast(event: string, payload: any) {
        this.socket.broadcast.emit(event, payload);
    }
}
