import { createHash } from "crypto";
import { createServer, Server, Socket } from "net";
import SteamUser from "steam-user";
import { SteamClient } from "./SteamClient";

export class SteamServer {
  private server: Server;

  private clients: SteamClient[];

  port: number;
  host: string;

  user: SteamUser;

  constructor(port: number = 36969, host: string = "127.0.0.1") {
    this.user = new SteamUser();

    this.port = port;
    this.host = host;

    this.clients = [];

    this.server = createServer();
    this.setupEvents();
  }

  public listen() {
    this.server.listen(this.port, this.host);
  }
  
  public login(username: string, password: string) {
    this.user.logOn({
      accountName: username,
      password
    });
  }

  public getEncryptedAppTicket(appId: number) {
    return this.user.getEncryptedAppTicket(appId);
  }

  public getSteamID64() {
    return this.user.steamID?.getSteamID64() || "";
  }

  public getPersonaName() {
    return this.user.accountInfo?.name || "";
  }

  public getPersonaID() {
    return createHash("sha256")
      .update(this.getSteamID64())
      .digest("hex");
  }

  private setupEvents() {
    this.user.on('loggedOn', this.onLogon.bind(this));
    this.user.on('accountInfo', this.onAccountInfo.bind(this));

    this.server.on('connect', this.onConnect.bind(this));
    this.server.on('error', this.onError.bind(this));
    this.server.on('close', this.onClose.bind(this));
  }

  private onLogon() {
    this.log(`SteamUser has logged on as ${this.user.steamID?.getSteamID64()}`);
  }

  private onAccountInfo() {
    this.log(` - Steam username: ${this.user.accountInfo?.name}`);
  }
  
  private onConnect(socket: Socket) {
    this.log("Server has a new connection!");

    this.clients.push(new SteamClient(socket, this));
  }

  private onError(err: Error) {
    this.log(`Server has encountered an error.`);
    this.log(err.message);
  }

  private onClose() {
    this.log("Server has closed");
  }

  private log(msg: string) {
    console.log(`[SERVER] ${msg}`);
  }
}