// ========== 消息分发中心 ==========
import {ProtoRequest, ProtoResponse} from "./protots/base";
import Log from "./Log";
import { MessageFns} from "./protots/main";
import { WebSocket } from "ws";
import ProtoIndex from "./protos/ProtoIndex";

class MessageDispatcher {
    private static _handlers = new Map<number, (request: ProtoRequest) => Promise<Uint8Array>>();


    // 注册协议处理器（使用双重泛型）
    static register<Req, Res>(
        ReqType: MessageFns<Req>,
        ResType: MessageFns<Res>,
        handler: (innerReq: Req, sequenceId: number) => Promise<Res>
    ) {
        const protocolId = ProtoIndex.getReqId(ReqType); // 协议ID
        this._handlers.set(protocolId, async (request: ProtoRequest) => {
            try {
                // 1. 自动解析内层请求
                const innerReq = ReqType.decode(request.message);

                Log.info(`Request:${ ProtoIndex.getIdStr(protocolId)} ${JSON.stringify(innerReq, null)}`);
                // 2. 执行业务逻辑（返回内层响应对象）
                const innerRes = await handler(innerReq, request.sequenceId);

                // 3. 自动构建外层响应
                const response = ProtoResponse.create({
                    sequenceId: request.sequenceId,
                    protocolId: protocolId + 1, // 响应ID=请求ID+1
                    message: ResType.encode(innerRes).finish()
                });

                Log.info(`Response:${  ProtoIndex.getIdStr(protocolId+1)} ${JSON.stringify(innerRes, null)}`);
                return ProtoResponse.encode(response).finish();
            } catch (err) {
                Log.error(`协议处理错误 [${protocolId}]:`, err);
                // 返回错误响应
                return this.buildErrorResponse(request.sequenceId, 500);
            }
        });
    }

    // 构建错误响应
    private static buildErrorResponse(sequenceId: number, code: number): Uint8Array {
        const errorResponse = ProtoResponse.create({
            sequenceId,
            protocolId: 0xFFFF, // 错误协议ID
            message: new TextEncoder().encode(`ERROR:${code}`)
        });
        return ProtoResponse.encode(errorResponse).finish();
    }

    // 处理消息入口
    static async handle(request: ProtoRequest, ws: WebSocket) {
        const handler = this._handlers.get(request.protocolId);
        if (!handler) {
            Log.warn(`未注册的协议ID: ${request.protocolId}`);
            ws.send(this.buildErrorResponse(request.sequenceId, 404));
            return;
        }
        const responseData = await handler(request);
        ws.send(responseData);
    }
}

export default MessageDispatcher;