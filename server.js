import express from 'express'
import ssr from './src/server'
import template from './src/template'
import { GamesManager, Game } from './Game'


const app = express()

const gamesMgr = new GamesManager();

// Landing page
app.get('/', (_, res) => {
  const content  = ssr({ isGame: false })
  const response = template(content, { isGame: false })
  res.send(response);
});

const handleNewGame = ({ gameId }) => {
  if (!gamesMgr.hasGame(gameId)) {
    const game = new Game(gameId);
    gamesMgr.addGame(game);
  }
  const game = gamesMgr.getGame(gameId);
  return game.getGameStateJSON();
}
// Game pages
app.get('/game/:gameId', (req, res) => {
  const gameId = req.params.gameId.toLowerCase();
  const gameState = handleNewGame({ gameId })
  const content  = ssr('game', gameState)
  const response = template(content, gameState)
  res.send(response);
});

// Draw
const handleDrawCard = ({ gameId, whoIsPlaying }) => {
  const game = gamesMgr.getGame(gameId);
  game.draw(whoIsPlaying);
  return game.getGameStateJSON()
}
app.get('/api/draw-card', (req, res) => {
  const { gameId, whoIsPlaying } = req.query;
  const gameState = handleDrawCard({ gameId, whoIsPlaying })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
});

// Keep in hand
const handleKeepInHand = ({ gameId, whoIsPlaying, drawnCard, cardPosition }) => {
  const game = gamesMgr.getGame(gameId);
  game.keepInHand(whoIsPlaying, drawnCard, cardPosition);
  return game.getGameStateJSON();
}
app.post('/api/keep-in-hand', (req, res) => {
  const { gameId, whoIsPlaying, drawnCard, cardPosition } = req.params
  const gameState = handleKeepInHand({
    gameId,
    whoIsPlaying,
    drawnCard,
    cardPosition
  })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
});

// Discard drawn card
const handleDiscardDrawnCard = ({ gameId, whoIsPlaying, drawnCard }) => {
  const game = gamesMgr.getGame(gameId);
  game.discard(whoIsPlaying, drawnCard);
  return game.getGameStateJSON();
}
app.post('/api/discard-drawn-card', (req, res) => {
  const { gameId, whoIsPlaying, drawnCard } = req.params
  const gameState = handleDiscardDrawnCard({ gameId, whoIsPlaying, drawnCard });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// End turn
const handleEndTurn = ({ gameId }) => {
  const game = gamesMgr.getGame(gameId);
  game.endTurn();
  return game.getGameStateJSON();
}
app.post('/api/end-turn', (req, res) => {
  const { gameId } = req.params
  const gameState = handleEndTurn({ gameId })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Start game
const handleStartGame = ({ gameId }) => {
  const game = gamesMgr.getGame(gameId)
  game.startGame()
  return game.getGameStateJSON()
}
app.post('/api/start-game', (req, res) => {
  const { gameId } = req.params;
  const gameState = handleStartGame({ gameId })
  res.send({ gameState })
  io.emit('game-state-update', { gameState });
})

// K, 10: Reveal my hand or another player's hand
const handleRevealHand = ({ gameId, whoIsPlaying, whoseHandToReveal }) => {
  const game = gamesMgr.getGame(gameId);
  game.revealHand(whoIsPlaying, whoseHandToReveal);
  return game.getGameStateJSON();
}
app.get('/api/reveal-hand', (req, res) => {
  const { gameId, whoIsPlaying, whoseHandToReveal } = req.query
  const gameState = handleRevealHand({ gameId, whoIsPlaying, whoseHandToReveal });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// J: Shuffle another person's cards
const handleShuffleHand = ({ gameId, whoIsPlaying, whoseCardsToShuffle }) => {
  const game = gamesMgr.getGame(gameId);
  game.shuffleHand(whoIsPlaying, whoseCardsToShuffle);
  return game.getGameStateJSON();
}
app.post('/api/shuffle-hand', (req, res) => {
  const { gameId, whoIsPlaying, whoseCardsToShuffle } = req.params
  const gameState = handleShuffleHand({ gameId, whoIsPlaying, whoseCardsToShuffle });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Q: Swap with another person's card
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
app.post('/api/swap-card-part-1', (req, res) => {
  const {
    gameId,
    whoIsPlaying,
    whoseCardToSwap,
    whichCardOfOpponentToSwap
  } = req.params;
  const gameState = handleSwapCardPart1({
    gameId,
    whoIsPlaying,
    whoseCardToSwap,
    whichCardOfOpponentToSwap
  })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

const handleSwapCardPart2 = ({ gameId, whoIsPlaying, whichCardOfSelfToSwap }) => {
  const game = gamesMgr.getGame(gameId);
  game.swapCardPart2(whoIsPlaying, whichCardOfSelfToSwap);
  return game.getGameStateJSON();
}
app.post('/api/swap-card-part-2', (req, res) => {
  const { gameId, whoIsPlaying, whichCardOfSelfToSwap } = req.params
  const gameState = handleSwapCardPart2({ gameId, whoIsPlaying, whichCardOfSelfToSwap });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Play again
const handlePlayAgain = ({ gameId }) => {
  const game = gamesMgr.getGame(gameId);
  game.setupNewGame(gameId);
  return game.getGameStateJSON();
}
app.post('/api/new-game', (req, res) => {
  const { gameId } = req.params;
  const gameState = handlePlayAgain({ gameId })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Delete games if last interaction has been a while ago
setInterval(
  () => {
    gamesMgr.forEach((game, gameId) => {
      if (game.lastInteraction < (Date.now() - 21600000)) {
        gamesMgr.delete(gameId);
      }
    })
  },
  86400000 // 24hrs
);

module.exports = {
  app,
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
  gamesMgr
}
