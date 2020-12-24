import express from 'express'
import socketio from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser'
import path from 'path'
import ssr from './src/server'
import template from './src/template'
import {
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
} from './handlers'


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


// Landing page
app.get('/', (_, res) => {
  const content  = ssr({ isGame: false })
  const response = template(content, { isGame: false })
  res.send(response);
});

// Game pages
app.get('/game/:gameId', (req, res) => {
  const gameId = req.params.gameId.toLowerCase();
  const gameState = handleNewGame({ gameId })
  const content  = ssr('game', gameState)
  const response = template(content, gameState)
  res.send(response);
});

// Draw
app.get('/api/draw-card', (req, res) => {
  const { gameId, whoIsPlaying } = req.query;
  const gameState = handleDrawCard({ gameId, whoIsPlaying })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
});

// Keep in hand
app.post('/api/keep-in-hand', (req, res) => {
  const { gameId, whoIsPlaying, drawnCard, cardPosition } = req.body
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
app.post('/api/discard-drawn-card', (req, res) => {
  const { gameId, whoIsPlaying, drawnCard } = req.body
  const gameState = handleDiscardDrawnCard({ gameId, whoIsPlaying, drawnCard });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// End turn
app.post('/api/end-turn', (req, res) => {
  const { gameId } = req.body
  const gameState = handleEndTurn({ gameId })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Start game
app.post('/api/start-game', (req, res) => {
  const { gameId } = req.body
  const gameState = handleStartGame({ gameId })
  res.send({ gameState })
  io.emit('game-state-update', { gameState });
})

// K, 10: Reveal my hand or another player's hand
app.get('/api/reveal-hand', (req, res) => {
  const { gameId, whoIsPlaying, whoseHandToReveal } = req.query
  const gameState = handleRevealHand({ gameId, whoIsPlaying, whoseHandToReveal });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// J: Shuffle another person's cards
app.post('/api/shuffle-hand', (req, res) => {
  const { gameId, whoIsPlaying, whoseCardsToShuffle } = req.body
  const gameState = handleShuffleHand({ gameId, whoIsPlaying, whoseCardsToShuffle });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Q: Swap with another person's card
app.post('/api/swap-card-part-1', (req, res) => {
  const {
    gameId,
    whoIsPlaying,
    whoseCardToSwap,
    whichCardOfOpponentToSwap
  } = req.body;
  const gameState = handleSwapCardPart1({
    gameId,
    whoIsPlaying,
    whoseCardToSwap,
    whichCardOfOpponentToSwap
  })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

app.post('/api/swap-card-part-2', (req, res) => {
  const { gameId, whoIsPlaying, whichCardOfSelfToSwap } = req.body
  const gameState = handleSwapCardPart2({ gameId, whoIsPlaying, whichCardOfSelfToSwap });
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})

// Play again
app.post('/api/new-game', (req, res) => {
  const { gameId } = req.body;
  const gameState = handlePlayAgain({ gameId })
  res.send({ gameState });
  io.emit('game-state-update', { gameState });
})
