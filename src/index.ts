import { SteamServer } from "./SteamServer";

const server = new SteamServer(36969);

server.login(process.argv[2], process.argv[3]);

server.listen();

process.on('SIGINT', () => {
  server.close();
  process.exit();
});