// ================ 基础架构层 ================

//导入所有服务
import { TaskService } from "./service/TaskService";
import { ActivityService } from "./service/ActivityService";
import { SignInService } from "./service/SignInService";
import {BaseService} from "./service/BaseService";
import {PlayerSession} from "./session/PlayerSession";
import config from "./config/config";
import Log from "./Log";
import http from "http";
import { WebSocketServer } from "ws";
import crypto from "crypto";

import {ProtoRequest, ProtoResponse} from "./protots/base";
import MessageDispatcher from "./MessageDispatcher";
import LoginService from "./service/LoginService";
import {LoginRequest, LoginResponse} from "./protots/main";

// ================ 游戏服务器主逻辑 ================
class GameServer {
    private ws: WebSocketServer;
    private services: BaseService[] = [];
    private sessions = new Map<string, PlayerSession>();

    constructor(port: number = 8000) {
        const server = http.createServer((req, res) => {
            res.end("WebSocket server is active");
        }).listen(port, () =>Log.info("Server running "+"http://localhost:"+ port));

        this.ws = new WebSocketServer({server});
        this.ws.on("connection", (ws) => {
            ws.on("error", (err) => console.error(err));

            ws.binaryType = "arraybuffer";

            Log.info("Total connected users: "+this.ws.clients.size);



            ws.on("message", (data:Buffer,isBinary) => {

                if (isBinary) {
                    const request = ProtoRequest.decode(new Uint8Array(data));

                    MessageDispatcher.handle(request, ws)
                }
            });
        });
    }

    private setupServices() {
        this.services.push(
            new LoginService()
        );

        // 未来添加新服务只需在此注册
        // this.services.push(new BattleService());
    }


    private onPlayerLogin(player: PlayerSession, nickname: string) {
        player.nickname = nickname;
        Log.info(`[登录] ${player.nickname} (ID: ${player.playerId})`);

        // 分发登录事件到所有服务
        this.services.forEach(service => {
            service.onPlayerLogin(player);
        });

        // 响应客户端
        player.sendMessage("login_success", {
            timestamp: Date.now()
        });
    }

    private onPlayerDisconnect(player: PlayerSession) {
        Log.info(`[断开] ${player.nickname} (ID: ${player.playerId})`);

        // 分发断线事件到所有服务
        this.services.forEach(service => {
            service.onPlayerDisconnect(player);
        });

        this.sessions.delete(player.playerId);
    }

    private routeMessage(player: PlayerSession, event: any) {
        // 路由格式：{ service: 'task', action: 'claim_reward', data: {...} }
        Log.info(`[消息路由] ${player.nickname}: `, event);

        const targetService = this.services.find(
            s => s.serviceName === event.service
        );

        if (targetService) {
            targetService.handleMessage(player, event.action, event.data);
        } else {
            console.error(`未知服务: ${event.service}`);
            player.sendMessage("error", { message: "服务不可用" });
        }
    }
}

// ================ 启动服务器 ================
const gameServer = new GameServer(config.port);
// 登录协议处理器
MessageDispatcher.register<LoginRequest, LoginResponse>(
    LoginRequest, // 请求类型
    LoginResponse, // 响应类型
    async (loginReq, sequenceId) => {
        Log.info(`登录请求 | 用户: ${loginReq.username}`);

        // 返回响应对象（无需手动编码）
        return LoginResponse.create({
            token: "session_token_xyz",
        });
    }
);