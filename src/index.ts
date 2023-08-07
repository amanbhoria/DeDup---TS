import {Server} from "./server/server";

(async ()=> {
    const server = new Server();
    await server.init();
})();