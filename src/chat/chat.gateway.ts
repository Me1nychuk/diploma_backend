import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { allowedOrigins } from 'src/main';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private sessions = new Map<string, Socket>();
  private users = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Користувач підключився: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Користувач відключився: ${client.id}`);

    this.users.delete(client.id);

    this.server.emit('users_online', Array.from(this.users.values()));
  }

  @SubscribeMessage('join_chat')
  handleJoin(
    client: Socket,
    { username, sessionId }: { username: string; sessionId: string },
  ) {
    const existingClient = this.sessions.get(sessionId);

    if (existingClient) {
      existingClient.join(client.id);
    } else {
      this.sessions.set(sessionId, client);
    }

    this.users.set(client.id, username);

    this.server.emit('users_online', Array.from(this.users.values()).length);
  }

  @SubscribeMessage('send_message')
  handleMessage(client: Socket, message: { user: string; text: string }) {
    const messageWithId = {
      ...message,
      id: message.user + new Date().getTime(),
    };
    this.server.emit('receive_message', messageWithId);
  }
}
