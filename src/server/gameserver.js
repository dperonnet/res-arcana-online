const Server = require("boardgame.io/server").Server;
const ResArcana = require("../client/components/game/Game").ResArcana;

const server = Server({ games: [ResArcana] });

server.run(8000);
