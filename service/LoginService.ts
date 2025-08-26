import { BaseService } from "./BaseService";
import {PlayerSession} from "../session/PlayerSession";
import {LoginRequest, LoginResponse} from "../protots/main";
import MessageDispatcher from "../MessageDispatcher";
import Log from "../Log";
// ================ 服务实现层 ================
/**
 * 任务服务
 */
export class LoginService extends BaseService {
    readonly serviceName = "LoginService";

    onPlayerLogin(player: PlayerSession): void {

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
    }

    handleMessage(player: PlayerSession, action: string, data: any): void {

    }
}
export default LoginService;