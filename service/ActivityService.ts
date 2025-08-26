import {BaseService} from "./BaseService";
import {PlayerSession} from "../session/PlayerSession";

/**
 * 活动服务
 */
export class ActivityService extends BaseService {
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
