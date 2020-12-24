
import { GamesManager, Game } from './Game'

const gamesMgr = new GamesManager();

const handleNewGame = ({ gameId }) => {
  if (!gamesMgr.hasGame(gameId)) {
    const game = new Game(gameId);
    gamesMgr.addGame(game);
  }
  const game = gamesMgr.getGame(gameId);
  return game.getGameStateJSON();
}

const handleDrawCard = ({ gameId, whoIsPlaying }) => {
  const game = gamesMgr.getGame(gameId);
  game.draw(whoIsPlaying);
  return game.getGameStateJSON()
}

const handleKeepInHand = ({ gameId, whoIsPlaying, drawnCard, cardPosition }) => {
  const game = gamesMgr.getGame(gameId);
  game.keepInHand(whoIsPlaying, drawnCard, cardPosition);
  return game.getGameStateJSON();
}

const handleDiscardDrawnCard = ({ gameId, whoIsPlaying, drawnCard }) => {
  const game = gamesMgr.getGame(gameId);
  game.discard(whoIsPlaying, drawnCard);
  return game.getGameStateJSON();
}

const handleEndTurn = ({ gameId }) => {
  const game = gamesMgr.getGame(gameId);
  game.endTurn();
  return game.getGameStateJSON();
}

const handleStartGame = ({ gameId }) => {
  const game = gamesMgr.getGame(gameId)
  game.startGame()
  return game.getGameStateJSON()
}

const handleRevealHand = ({ gameId, whoIsPlaying, whoseHandToReveal }) => {
  const game = gamesMgr.getGame(gameId);
  game.revealHand(whoIsPlaying, whoseHandToReveal);
  return game.getGameStateJSON();
}

const handleShuffleHand = ({ gameId, whoIsPlaying, whoseCardsToShuffle }) => {
  const game = gamesMgr.getGame(gameId);
  game.shuffleHand(whoIsPlaying, whoseCardsToShuffle);
  return game.getGameStateJSON();
}

const handleSwapCardPart1 = ({
  gameId,
  whoIsPlaying,
  whoseCardToSwap,
  whichCardOfOpponentToSwap
}) => {
  const game = gamesMgr.getGame(gameId);
  game.swapCardPart1(whoIsPlaying, whoseCardToSwap, whichCardOfOpponentToSwap);
  return game.getGameStateJSON();
}

const handleSwapCardPart2 = ({ gameId, whoIsPlaying, whichCardOfSelfToSwap }) => {
  const game = gamesMgr.getGame(gameId);
  game.swapCardPart2(whoIsPlaying, whichCardOfSelfToSwap);
  return game.getGameStateJSON();
}

const handlePlayAgain = ({ gameId }) => {
  const game = gamesMgr.getGame(gameId);
  game.setupNewGame(gameId);
  return game.getGameStateJSON();
}

// Delete games if last interaction has been a while ago
setInterval(
  () => {
    gamesMgr.forEach((game, gameId) => {
      if (game.lastInteraction < (Date.now() - 21600000)) {
        gamesMgr.removeGame(gameId);
      }
    })
  },
  86400000 // 24hrs
);



module.exports = {
  handleNewGame,
  handleStartGame,
  handleRevealHand,
  handleDrawCard,
  handleDiscardDrawnCard,
  handleEndTurn,
  handleKeepInHand,
  handleShuffleHand,
  handleSwapCardPart1,
  handleSwapCardPart2,
  handlePlayAgain,
  gamesMgr
}