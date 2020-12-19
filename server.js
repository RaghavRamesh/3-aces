import express from 'express'
import http from 'http';
import socketio from 'socket.io';
import bodyParser from 'body-parser'
import path from 'path'
import template from './src/template'
import ssr from './src/server'
import { Game, GamesManager } from './Game';

const app = express()
const httpServer = http.createServer(app)
const io = socketio(httpServer);

// Serving static files
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use('/game/assets', express.static(path.resolve(__dirname, 'assets')));
// for parsing application/json
app.use(bodyParser.json());
// hide powered by express
app.disable('x-powered-by');

// start the server
httpServer.listen(process.env.PORT || 3000);


const gamesMgr = new GamesManager();

// Landing page
app.get('/', (_, res) => {
  const content  = ssr({ isGame: false })
  const response = template(content, { isGame: false })
  res.send(response);
});

// Game pages
app.get('/game/:gameId', (req, res) => {
  const gameId = req.params.gameId.toLowerCase();
  if (!gamesMgr.hasGame(gameId)) {
    const game = new Game(gameId);
    gamesMgr.addGame(game);
  }
  const game = gamesMgr.getGame(gameId);
  const gameState = game.getGameStateJSON();
  console.log(`[/game/${gameId}] gameState:`, gameState);
  const content  = ssr('game', gameState)
  const response = template(content, gameState)
  res.send(response);
});

// Draw
app.get('/api/draw-card', (req, res) => {
  const { gameId, whoIsPlaying } = req.query;
  const game = gamesMgr.getGame(gameId);
  game.draw(whoIsPlaying);
  const gameState = game.getGameStateJSON()
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
});

// Keep in hand
app.post('/api/keep-in-hand', (req, res) => {
  const { gameId, whoIsPlaying, drawnCard, cardPosition } = req.params
  const game = gamesMgr.getGame(gameId);
  game.keepInHand(whoIsPlaying, drawnCard, cardPosition);
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
});

// Discard
app.post('/api/discard-drawn-card', (req, res) => {
  const { gameId, whoIsPlaying, drawnCard } = req.params
  console.log('[discard-drawn-card]', req.params)
  const game = gamesMgr.getGame(gameId);
  game.discard(whoIsPlaying, drawnCard);
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// End turn
app.post('/api/end-turn', (req, res) => {
  const { gameId } = req.params
  const game = gamesMgr.getGame(gameId);
  game.endTurn();
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// K, 10: Reveal my hand or another player's hand
app.get('/api/reveal-hand', (req, res) => {
  console.log('[reveal-hand] req.query:', req.query);
  const { gameId, whoIsPlaying, whoseHandToReveal } = req.query

  const game = gamesMgr.getGame(gameId);
  game.revealHand(whoIsPlaying, whoseHandToReveal);
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  console.log('[api/reveal-hand] gameState:', gameState);
  io.emit('game-state-update', { gameState });
})

// J: Shuffle another person's cards
app.post('/api/shuffle-hand', (req, res) => {
  const { gameId, whoIsPlaying, whoseCardsToShuffle } = req.params
  const game = gamesMgr.getGame(gameId);
  game.shuffleHand(whoIsPlaying, whoseCardsToShuffle);
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Q: Swap with another person's card
app.post('/api/swap-card-part-2', (req, res) => {
  const {
    gameId,
    whoIsPlaying,
    whichCardOfSelfToSwap,
  } = req.params
  const game = gamesMgr.getGame(gameId);
  game.swapCardPart2(whoIsPlaying, whichCardOfSelfToSwap);
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

app.post('/api/swap-card-part-1', (req, res) => {
  const {
    gameId,
    whoIsPlaying,
    whoseCardToSwap,
    whichCardOfOpponentToSwap
  } = req.params;
  const game = gamesMgr.getGame(gameId);
  game.swapCardPart1(whoIsPlaying, whoseCardToSwap, whichCardOfOpponentToSwap);
  const gameState = game.getGameStateJSON();
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Play again
app.post('/api/new-game', (req, res) => {
  const { gameId } = req.params;
  const game = gamesMgr.getGame(gameId);
  game.startNewGame(gameId);
  const gameState = game.getGameStateJSON();
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
