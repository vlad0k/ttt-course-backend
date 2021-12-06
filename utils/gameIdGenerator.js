const LENGTH = 5;

const gameIdGenerator = () => {
  let result = "";

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < LENGTH; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

module.exports = gameIdGenerator;
