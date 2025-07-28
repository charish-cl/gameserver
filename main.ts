// ================ 基础架构层 ================
import { Server, Socket } from "socket.io";
import { createServer } from "http";

/**
 * 游戏服务基类
 */
abstract class GameService {
    // 服务名称（供调试使用）
    abstract readonly serviceName: string;

    // 玩家登录时的回调
    onPlayerLogin(player: PlayerSession): void {
        console.log(`[${this.serviceName}] 默认登录处理`);
    }

    // 玩家断线时的回调
    onPlayerDisconnect(player: PlayerSession): void {
        console.log(`[${this.serviceName}] 默认断开处理`);
    }

    // 自定义消息处理（子类实现）
    abstract handleMessage(
        player: PlayerSession,
        action: string,
        data: any
    ): void;
}

/**
 * 玩家会话类（封装客户端连接）
 */
class PlayerSession {
    public playerId: string;
    public socket: Socket;
    public nickname: string = "Guest";
    public loginTime: number = Date.now();

    // 玩家状态存储
    private state: Record<string, any> = {};

    constructor(socket: Socket) {
        this.socket = socket;
        this.playerId = socket.id;
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

// ================ 服务实现层 ================
/**
 * 任务服务
 */
class TaskService extends GameService {
    readonly serviceName = "任务系统";

    private dailyTasks = [
        { id: 1, name: "击杀怪物", progress: 0, goal: 10 },
        { id: 2, name: "完成副本", progress: 0, goal: 3 }
    ];

    onPlayerLogin(player: PlayerSession): void {
        super.onPlayerLogin(player);
        // 推送每日任务
        player.sendMessage("task_update", {
            tasks: this.dailyTasks
        });
    }

    handleMessage(player: PlayerSession, action: string, data: any): void {
        if (action === "claim_reward") {
            console.log(`[任务系统] 玩家 ${player.nickname} 领取奖励 ${data.taskId}`);
            // 奖励发放逻辑...
        }
    }
}

/**
 * 活动服务
 */
class ActivityService extends GameService {
    readonly serviceName = "活动系统";

    private activeEvents = [
        { id: "summer_event", name: "夏日庆典", endTime: Date.now() + 86400000 }
    ];

    onPlayerLogin(player: PlayerSession): void {
        super.onPlayerLogin(player);
        // 推送进行中的活动
        player.sendMessage("event_list", {
            events: this.activeEvents
        });
    }

    handleMessage(player: PlayerSession, action: string, data: any): void {
        if (action === "join_event") {
            console.log(`[活动系统] 玩家 ${player.nickname} 参与活动 ${data.eventId}`);
            // 活动参与逻辑...
        }
    }
}

/**
 * 签到服务
 */
class SignInService extends GameService {
    readonly serviceName = "签到系统";

    private lastSignDate: Record<string, number> = {};

    onPlayerLogin(player: PlayerSession): void {
        super.onPlayerLogin(player);

        // 检查上次签到日期
        const lastSign = this.lastSignDate[player.playerId] || 0;
        const today = new Date().setHours(0, 0, 0, 0);

        if (lastSign < today) {
            player.sendMessage("sign_in_remind", { signed: false });
        } else {
            player.sendMessage("sign_in_remind", { signed: true });
        }
    }

    handleMessage(player: PlayerSession, action: string, data: any): void {
        if (action === "daily_sign") {
            const today = new Date().setHours(0, 0, 0, 0);
            this.lastSignDate[player.playerId] = today;
            console.log(`[签到系统] 玩家 ${player.nickname} 完成签到`);
            player.sendMessage("sign_in_success", { reward: { gold: 50 } });
        }
    }
}

// ================ 游戏服务器主逻辑 ================
class GameServer {
    private io: Server;
    private services: GameService[] = [];
    private sessions = new Map<string, PlayerSession>();

    constructor(port: number = 3000) {
        const httpServer = createServer();
        this.io = new Server(httpServer, {
            cors: { origin: "*" } // 生产环境应限制来源
        });

        this.setupServices();
        this.setupEventListeners();

        httpServer.listen(port, () => {
            console.log(`游戏服务器已在端口 ${port} 启动`);
        });
    }

    // 注册游戏服务
    private setupServices() {
        this.services.push(
            new TaskService(),
            new ActivityService(),
            new SignInService()
        );

        // 未来添加新服务只需在此注册
        // this.services.push(new BattleService());
    }

    private setupEventListeners() {
        this.io.on("connection", (socket: Socket) => {
            console.log(`玩家连接: ${socket.id}`);

            // 创建玩家会话
            const player = new PlayerSession(socket);
            this.sessions.set(socket.id, player);

            // 登录事件处理（来自客户端）
            socket.on("player_login", (data: { nickname: string }) => {
                this.onPlayerLogin(player, data.nickname);
            });

            // 断开连接处理
            socket.on("disconnect", () => {
                this.onPlayerDisconnect(player);
            });

            // 消息路由（格式：{ service: 'task', action: 'claim_reward', data: {...} }）
            socket.on("game_event", (event: any) => {
                this.routeMessage(player, event);
            });
        });
    }

    private onPlayerLogin(player: PlayerSession, nickname: string) {
        player.nickname = nickname;
        console.log(`[登录] ${player.nickname} (ID: ${player.playerId})`);

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
        console.log(`[断开] ${player.nickname} (ID: ${player.playerId})`);

        // 分发断线事件到所有服务
        this.services.forEach(service => {
            service.onPlayerDisconnect(player);
        });

        this.sessions.delete(player.playerId);
    }

    private routeMessage(player: PlayerSession, event: any) {
        // 路由格式：{ service: 'task', action: 'claim_reward', data: {...} }
        console.log(`[消息路由] ${player.nickname}: `, event);

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
const gameServer = new GameServer(8000);