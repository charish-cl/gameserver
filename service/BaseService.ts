
import { PlayerSession } from "../session/PlayerSession"
/**
 * 游戏服务基类
 */
export abstract class BaseService {
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
