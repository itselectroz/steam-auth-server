import { Socket } from 'net';

import { SteamServer } from "./SteamServer";

export class SteamClient {
  private server: SteamServer;
  private socket: Socket;

  constructor(socket: Socket, server: SteamServer) {
    this.socket = socket;
    this.server = server;
  }
}