import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class MessagesController {
    private readonly messagesService;
    private readonly jwtService;
    private readonly configService;
    constructor(messagesService: MessagesService, jwtService: JwtService, configService: ConfigService);
    myConversations(req: any): Promise<any[]>;
    startForEmployee(employeeId: string): Promise<import("./entities/conversation.entity").Conversation>;
    startMine(req: any): Promise<import("./entities/conversation.entity").Conversation>;
    getMessages(req: any, id: string): Promise<import("./entities/message.entity").Message[]>;
    markRead(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    send(req: any, id: string, body: any): Promise<import("./entities/message.entity").Message>;
    stream(id: string, token?: string): Promise<import("rxjs").Observable<any>>;
}
