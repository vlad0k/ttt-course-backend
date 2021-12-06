class Game {
  X = "X";
  O = "O";

  isWin = false;
  currentMove = this.X;

  wsInstances = [];

  constructor() {
    this.table = Array(9).fill(null);
  }

  checkWin() {
    const winVariants = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const isEmtyCell = this.table.find((cellValue) => cellValue === null);

    if (isEmtyCell === undefined) {
      this.isWin = true;
      return { type: "DRAW" };
    }

    let winRes;

    winVariants.forEach((variant) => {
      if (
        this.table[variant[0]] === this.table[variant[1]] &&
        this.table[variant[0]] === this.table[variant[2]] &&
        this.table[variant[0]] !== null &&
        this.table[variant[1]] !== null &&
        this.table[variant[2]] !== null
      ) {
        this.isWin = true;

        winRes = { type: "WIN", winner: this.table[variant[0]] };
      }
    });

    return winRes;
  }

  makeMove(player, cellNumber) {
    if (
      (player === this.X || player === this.O) &&
      cellNumber >= 0 &&
      cellNumber <= 8 &&
      !this.isWin
    ) {
      if (this.table[cellNumber]) {
        throw new Error("This cell is already taken");
      }

      if (this.currentMove !== player) {
        throw new Error(`Waiting ${this.currentMove} move`);
      }

      this.currentMove = this.currentMove === this.X ? this.O : this.X;

      this.table[cellNumber] = player;

      this.sendTableStateToPlayers();

      const winResult = this.checkWin();
      console.log("winRes:", winResult);
      if (winResult) {
        this.sendWinResultToPlayers(winResult);
      }

      return this.table;
    } else {
      throw new Error("Incorrect player or cell number");
    }
  }

  subscribeWsInstance(ws) {
    this.wsInstances.push(ws);
  }

  sendTableStateToPlayers() {
    this.wsInstances.forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "TABLE",
          table: this.table,
          currentMove: this.currentMove,
        })
      );
    });
  }

  sendWinResultToPlayers(winResult) {
    this.wsInstances.forEach((ws) => {
      ws.send(JSON.stringify(winResult));
    });
  }
}

module.exports = Game;
