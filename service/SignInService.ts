import { BaseService } from "./BaseService";
import {PlayerSession} from "../session/PlayerSession";
/**
 * 签到服务
 */
export class SignInService extends BaseService {
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