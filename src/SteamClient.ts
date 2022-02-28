import { Socket } from 'net';

import { SteamServer } from "./SteamServer";

export class SteamClient {
  private server: SteamServer;
  private socket: Socket;

  constructor(socket: Socket, server: SteamServer) {
    this.log("New steam client!");
    
    this.socket = socket;
    this.server = server;

    this.setupEvents();

    this.sendAccountData();
  }

  public sendAccountData() {
    this.log("Sending account data.");
    this.sendMessage("personaName", this.writeUTF(this.server.getPersonaName()));
    this.sendMessage("steamID", this.writeUTF(this.server.getSteamID64()));
    this.sendMessage("personaID", this.writeUTF(this.server.getPersonaID()));
  }

  private setupEvents() {
    this.socket.on('data', this.onData.bind(this));
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('close', this.onClose.bind(this));
  }

  private writeUTF(message: string) {
    const buffer = Buffer.alloc(2 + message.length);
  
    buffer.writeUInt16BE(message.length);
    buffer.write(message, 2);
  
    return buffer;
  }

  private sendMessage(message: string, data: Buffer) {
    const buffer = Buffer.concat([
      this.writeUTF(message),
      data
    ]);

    this.socket.write(buffer);
  }
    
  private async onData(data: Buffer) {
    const message = data.toString();

    this.log(`Received a ${message} request.`);

    switch(message) {
      case "ticket":
        const ticket = await this.server.getEncryptedAppTicket(!!process.env.APPID ? Number.parseInt(process.env.APPID) : 291550 );
        
        if(!ticket.encryptedAppTicket) {
          this.log("Unable to generate app ticket.");
          break;
        }

        this.sendMessage("ticket", Buffer.from([
          ...ticket.encryptedAppTicket, 
          ticket.encryptedAppTicket.length
        ]));
        
        this.log(`Sent encrypted app ticket to client.`);

        break;
    }
  }

  private onError(error: Error) {
    this.log(`Had error ${error}`);
  }

  private onClose(hadError: boolean) {
    this.log(`Connection cloesd.`);
  }

  private log(msg: string) {
    console.log(`[CLIENT] ${msg}`);
  }
}