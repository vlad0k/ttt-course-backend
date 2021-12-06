const express = require("express");
const bodyParser = require("body-parser");
const expressWs = require("express-ws");
const cors = require("cors");

require("dotenv").config();

const Game = require("./game");
const gameIdGenerator = require("./utils/gameIdGenerator");

const state = {
  games: {},
  wsInstances: [],
  openGames: [],
};

const app = express();
expressWs(app);
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.post("/start-game", (req, res) => {
  const newGameId = gameIdGenerator();

  state.games[newGameId] = new Game();
  state.openGames.push(newGameId);

  res.json({
    player: "X",
    gameId: newGameId,
  });
});

app.get("/gameid-list", (req, res) => {
  res.json(state.openGames);
});

app.post("/select-game", (req, res) => {
  const gameId = req.body.gameId;

  if (!state.openGames.includes(gameId)) {
    res.status(500).send("No games with such gameId").end();
    return;
  }

  state.openGames = state.openGames.filter((openGame) => openGame !== gameId);

  res.json({
    player: "O",
    gameId: gameId,
    currentMove: state.games[gameId].currentMove,
    table: state.games[gameId].table,
  });
});

app.post("/make-move", (req, res) => {
  const gameId = req.body.gameId;
  const player = req.body.player;
  const cellNumber = req.body.cellNumber;

  if (player !== "X" && player !== "O") {
    res.status(500).send("Player should be 'X' or 'O'");
  }

  if (cellNumber < 0 || cellNumber > 9) {
    res.status(500).send("cellNumber can be between 0 and 9");
  }

  const game = state.games[gameId];

  if (game) {
    try {
      const table = game.makeMove(player, cellNumber);
      res.json(table);
    } catch (error) {
      res.status(500).send(`${error.message} ${error.lineNumber}`);
    }
  } else {
    res.status(500).send("No game with such gameID");
  }
});

app.ws("/ws/:gameId", (ws, req) => {
  const gameId = req.params.gameId;

  const game = state.games[gameId];

  if (game) {
    game.subscribeWsInstance(ws);
  } else {
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: `No game with id ${gameId}`,
      })
    );

    ws.close();
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
