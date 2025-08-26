import {LoginRequest,LoginResponse,ChatNotify,ChatRequest,ChatResponse,} from "../protots/main";
import { ProtocolType } from "../protots/prototype";
class ProtoIndex {

    private static _req2Id = new Map<any, number>([
            [LoginRequest, ProtocolType.LOGIN_REQUEST],
            [LoginResponse, ProtocolType.LOGIN_RESPONSE],
            [ChatNotify, ProtocolType.CHAT_NOTIFY],
            [ChatRequest, ProtocolType.CHAT_REQUEST],
            [ChatResponse, ProtocolType.CHAT_RESPONSE],
    ]);

    private static _Id2Str = new Map<number, string>([
            [ProtocolType.LOGIN_REQUEST, "LoginRequest"],
            [ProtocolType.LOGIN_RESPONSE, "LoginResponse"],
            [ProtocolType.CHAT_NOTIFY, "ChatNotify"],
            [ProtocolType.CHAT_REQUEST, "ChatRequest"],
            [ProtocolType.CHAT_RESPONSE, "ChatResponse"],

    ]);

    public static getReqId(req: any): number {
        return ProtoIndex._req2Id.get(req) || ProtocolType.None;
    }

    public static getIdStr(id: number): string {
        return ProtoIndex._Id2Str.get(id) || "None";
    }
}

export default ProtoIndex;