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
  gamesMgr
} from './server'


test('New game', () => {
  const gameState = handleNewGame({ gameId: 'test' })
  const {
    drawnCard,
    nextTurn,
    hasGameStarted,
    message,
    deck,
    player1,
    player2
  } = gameState
  expect(hasGameStarted).toBe(false)
  expect(deck.length).toBe(52 - 6)
  expect(message).toBe('All players can see their respective cards')
  expect(drawnCard).toBe(null)
  expect(nextTurn).toBe('P1')
  expect(player1.enableRevealHand).toBe(true)
  expect(player2.enableRevealHand).toBe(true)
  gamesMgr.removeGame('test')
})

test('Start game', () => {
  handleNewGame({ gameId: 'test' })
  handleRevealHand({
    gameId: 'test',
    whoIsPlaying: 'P1',
    whoseHandToReveal: 'P1'
  })
  const gameStateBeforeStartingGame = handleRevealHand({
    gameId: 'test',
    whoIsPlaying: 'P2',
    whoseHandToReveal: 'P2'
  })
  expect(gameStateBeforeStartingGame.player1.hand[0].value).not.toEqual('hidden')
  expect(gameStateBeforeStartingGame.player2.hand[0].value).not.toEqual('hidden')
  const gameState = handleStartGame({ gameId: 'test' })
  const {
    hasGameStarted,
    gameId,
    player1,
    player2
  } = gameState

  expect(gameId).toBe('test')
  expect(hasGameStarted).toBe(true)
  expect(player1.hand[0]).toEqual('hidden')
  expect(player2.hand[0]).toEqual('hidden')
  expect(player1.enableRevealHand).toBe(false)
  expect(player2.enableRevealHand).toBe(false)
  gamesMgr.removeGame('test')
})

test('Draw and discard card', () => {
  handleNewGame({ gameId: 'test' })
  handleStartGame({ gameId: 'test' })
  const gameStateAfterDrawCard = handleDrawCard({
    gameId: 'test',
    whoIsPlaying: 'P1'
  })
  expect(gameStateAfterDrawCard.deck.length).toBe(52 - 6 - 1)
  expect(gameStateAfterDrawCard.drawnCard.value).not.toBe(null)
  expect(gameStateAfterDrawCard.message).toBe('You can either discard or replace with one of the cards in your hand')
  const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
    gameId: 'test',
    whoIsPlaying: 'P1',
    drawnCard: gameStateAfterDrawCard.drawnCard
  })
  expect(gameStateAfterDiscardingCard.topDiscardCard.value).toBe(gameStateAfterDrawCard.drawnCard.value)
  expect(gameStateAfterDiscardingCard.drawnCard).toBe(null)
  const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
  expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
  expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
  gamesMgr.removeGame('test')
})

test('Draw and replace with first card in hand', () => {
  handleNewGame({ gameId: 'test' })
  const game = gamesMgr.getGame('test')
  handleStartGame({ gameId: 'test' })
  const gameStateAfterDrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
  const cardAtPosition0 = game.player1.hand.cards[0]
  const gameStateAfterReplacingDrawnCardWithCardInHand = handleKeepInHand({
    gameId: 'test',
    whoIsPlaying: 'P1',
    drawnCard: gameStateAfterDrawingCard.drawnCard,
    cardPosition: 0
  })
  expect(gameStateAfterReplacingDrawnCardWithCardInHand.topDiscardCard).toEqual(cardAtPosition0)
  expect(game.player1.hand.cards[0]).toEqual(gameStateAfterDrawingCard.drawnCard)
  expect(gameStateAfterReplacingDrawnCardWithCardInHand.drawnCard).toBe(null);
  const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
  expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
  expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
  gamesMgr.removeGame('test')
})

test('discard drawn card and that is special card', () => {

})

test('discard replaced card and that is special card', () => {

})

test('swap card', () => {

})

test("reveal another person's cards", () => {})

test('reveal own cards', () => {})

test("shuffle another person's cards", () => {})