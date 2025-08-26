import { BaseService } from "./BaseService";
import {PlayerSession} from "../session/PlayerSession";
// ================ 服务实现层 ================
/**
 * 任务服务
 */
export class TaskService extends BaseService {
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