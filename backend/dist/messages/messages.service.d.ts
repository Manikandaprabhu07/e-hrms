import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployeesService } from '../employees/employees.service';
import { Observable } from 'rxjs';
export declare class MessagesService {
    private conversationsRepository;
    private messagesRepository;
    private usersService;
    private employeesService;
    private notificationsService;
    private cachedAdminUserId;
    private conversationStreams;
    constructor(conversationsRepository: Repository<Conversation>, messagesRepository: Repository<Message>, usersService: UsersService, employeesService: EmployeesService, notificationsService: NotificationsService);
    private getAdminUserId;
    private assertMember;
    ensureEmployeeConversation(employeeUserId: string): Promise<Conversation>;
    ensureConversationForEmployeeId(employeeId: string): Promise<Conversation>;
    listMyConversations(userId: string): Promise<any[]>;
    getConversationMessages(conversationId: string, userId: string): Promise<Message[]>;
    markConversationRead(conversationId: string, userId: string): Promise<void>;
    getConversationStream(conversationId: string, userId: string): Promise<Observable<any>>;
    sendMessage(conversationId: string, userId: string, content: string): Promise<Message>;
    private ensureConversationSubject;
}
