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

describe("New game and start game", () => {
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
})

describe("Drawing and discarding", () => {
  test('P1: Draw and discard card', () => {
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

  test('P1: Draw and replace with first card in hand', () => {
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
    expect(gameStateAfterReplacingDrawnCardWithCardInHand.message).toBe('P1 replaced their card #1 with the drawn card')
    const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
    gamesMgr.removeGame('test')
  })

  test('P2: Draw and replace with second card in hand', () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterP1DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    handleKeepInHand({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterP1DrawingCard.drawnCard,
      cardPosition: 0
    })
    const gameStateAfterP1TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP1TurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterP1TurnEnds.nextTurn).toEqual('P2')

    const game = gamesMgr.getGame('test')
    const gameStateAfterP2DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P2' })
    const cardAtPosition1 = game.player2.hand.cards[1]
    const gameStateAfterReplacingDrawnCardWithCardInHand = handleKeepInHand({
      gameId: 'test',
      whoIsPlaying: 'P2',
      drawnCard: gameStateAfterP2DrawingCard.drawnCard,
      cardPosition: 1
    })
    expect(gameStateAfterReplacingDrawnCardWithCardInHand.topDiscardCard).toEqual(cardAtPosition1)
    expect(game.player2.hand.cards[1]).toEqual(gameStateAfterP2DrawingCard.drawnCard)
    expect(gameStateAfterReplacingDrawnCardWithCardInHand.drawnCard).toBe(null);
    expect(gameStateAfterReplacingDrawnCardWithCardInHand.message).toBe('P2 replaced their card #2 with the drawn card')
    const gameStateAfterP2TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP2TurnEnds.message).toEqual(`P1's turn`)
    expect(gameStateAfterP2TurnEnds.nextTurn).toEqual('P1')

    gamesMgr.removeGame('test')
  })
})

describe("Q: Swapping with an opponent's cards", () => {
  test("P1 swapping one of their cards with one of P2's cards", () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterDrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    gameStateAfterDrawingCard.drawnCard = { value: 'Q', suit: 'Spades' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterDrawingCard.drawnCard
    })
    const game = gamesMgr.getGame('test')
    const cardOfOppositionBeforeSwap = game.player2.hand.cards[2];
    const cardOfSelfBeforeSwap = game.player1.hand.cards[1];
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterDrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player2.enableSwapCards).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P1 can now swap one of their cards with an opponent's card`)
    const gameStateAfterSwapCardStep1 = handleSwapCardPart1({
      gameId: 'test',
      whoIsPlaying: 'P1',
      whoseCardToSwap: 'P2',
      whichCardOfOpponentToSwap: 2
    })
    expect(gameStateAfterSwapCardStep1.swapInProgress).toBe(true)
    expect(gameStateAfterSwapCardStep1.specialCardMessage).toEqual(`Choose one of your cards to swap`)
    const gameStateAfterSwapCardStep2 = handleSwapCardPart2({
      gameId: 'test',
      whoIsPlaying: 'P1',
      whichCardOfSelfToSwap: 1
    })
    const cardOfOppositionAfterSwap = game.player2.hand.cards[2]
    const cardOfSelfAfterSwap = game.player1.hand.cards[1]
    expect(cardOfSelfBeforeSwap).toEqual(cardOfOppositionAfterSwap)
    expect(cardOfOppositionBeforeSwap).toEqual(cardOfSelfAfterSwap)
    expect(gameStateAfterSwapCardStep2.specialCardMessage).toEqual(`P1 has replaced their card #2 with P2's card #3`)
    const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterTurnEnds.player2.enableSwapCards).toBe(false)
    expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
    expect(gameStateAfterTurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })

  test("P2 swapping one of their cards with one of P1's cards", () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterP1DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterP1DrawingCard.drawnCard
    })
    const gameStateAfterP1TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP1TurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterP1TurnEnds.nextTurn).toEqual('P2')

    const gameStateAfterP2DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    gameStateAfterP2DrawingCard.drawnCard = { value: 'Q', suit: 'Spades' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P2',
      drawnCard: gameStateAfterP2DrawingCard.drawnCard
    })
    const game = gamesMgr.getGame('test')
    const cardOfOppositionBeforeSwap = game.player1.hand.cards[0];
    const cardOfSelfBeforeSwap = game.player2.hand.cards[2];
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterP2DrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player1.enableSwapCards).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P2 can now swap one of their cards with an opponent's card`)
    const gameStateAfterSwapCardStep1 = handleSwapCardPart1({
      gameId: 'test',
      whoIsPlaying: 'P2',
      whoseCardToSwap: 'P1',
      whichCardOfOpponentToSwap: 0
    })
    expect(gameStateAfterSwapCardStep1.swapInProgress).toBe(true)
    expect(gameStateAfterSwapCardStep1.specialCardMessage).toEqual(`Choose one of your cards to swap`)
    const gameStateAfterSwapCardStep2 = handleSwapCardPart2({
      gameId: 'test',
      whoIsPlaying: 'P2',
      whichCardOfSelfToSwap: 2
    })
    const cardOfOppositionAfterSwap = game.player1.hand.cards[0]
    const cardOfSelfAfterSwap = game.player2.hand.cards[2]
    expect(cardOfSelfBeforeSwap).toEqual(cardOfOppositionAfterSwap)
    expect(cardOfOppositionBeforeSwap).toEqual(cardOfSelfAfterSwap)
    expect(gameStateAfterSwapCardStep2.specialCardMessage).toEqual(`P2 has replaced their card #3 with P1's card #1`)
    const gameStateAfterP2TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP2TurnEnds.player1.enableSwapCards).toBe(false)
    expect(gameStateAfterP2TurnEnds.message).toEqual(`P1's turn`)
    expect(gameStateAfterP2TurnEnds.nextTurn).toEqual('P1')
    expect(gameStateAfterP2TurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })
})

describe("10: Seeing an opponent's cards", () => {
  test("P1 seeing P2's cards", () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterDrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    gameStateAfterDrawingCard.drawnCard = { value: '10', suit: 'Clubs' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterDrawingCard.drawnCard
    })
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterDrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player2.enableRevealHand).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P1 can now see an opponent's cards`)
    const gameStateAfterRevealingHand = handleRevealHand({
      gameId: 'test',
      whoIsPlaying: 'P1',
      whoseHandToReveal: 'P2'
    })
    expect(gameStateAfterRevealingHand.player2.hand[0]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player2.hand[1]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player2.hand[2]).not.toBe('hidden')
    const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterTurnEnds.player2.enableRevealHand).toBe(false)
    expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
    expect(gameStateAfterTurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })

  test("P2 seeing P1's cards", () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterP1DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterP1DrawingCard.drawnCard
    })
    const gameStateAfterP1TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP1TurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterP1TurnEnds.nextTurn).toEqual('P2')

    const gameStateAfterP2DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P2' })
    gameStateAfterP2DrawingCard.drawnCard = { value: '10', suit: 'Clubs' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P2',
      drawnCard: gameStateAfterP2DrawingCard.drawnCard
    })
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterP2DrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player1.enableRevealHand).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P2 can now see an opponent's cards`)
    const gameStateAfterRevealingHand = handleRevealHand({
      gameId: 'test',
      whoIsPlaying: 'P2',
      whoseHandToReveal: 'P1'
    })
    expect(gameStateAfterRevealingHand.player1.hand[0]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player1.hand[1]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player1.hand[2]).not.toBe('hidden')
    const gameStateAfterP2TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP2TurnEnds.player1.enableRevealHand).toBe(false)
    expect(gameStateAfterP2TurnEnds.message).toEqual(`P1's turn`)
    expect(gameStateAfterP2TurnEnds.nextTurn).toEqual('P1')
    expect(gameStateAfterP2TurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })
})

describe("K: Seeing one's own cards", () => {
  test('P1 seeing their own cards', () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterDrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    gameStateAfterDrawingCard.drawnCard = { value: 'K', suit: 'Hearts' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterDrawingCard.drawnCard
    })
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterDrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player1.enableRevealHand).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P1 can now see their cards`)
    const gameStateAfterRevealingHand = handleRevealHand({
      gameId: 'test',
      whoIsPlaying: 'P1',
      whoseHandToReveal: 'P1'
    })
    expect(gameStateAfterRevealingHand.player1.hand[0]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player1.hand[1]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player1.hand[2]).not.toBe('hidden')
    const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterTurnEnds.player1.enableRevealHand).toBe(false)
    expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
    expect(gameStateAfterTurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })

  test('P2 seeing their own cards', () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterP1DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterP1DrawingCard.drawnCard
    })
    const gameStateAfterP1TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP1TurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterP1TurnEnds.nextTurn).toEqual('P2')

    const gameStateAfterP2DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P2' })
    gameStateAfterP2DrawingCard.drawnCard = { value: 'K', suit: 'Hearts' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P2',
      drawnCard: gameStateAfterP2DrawingCard.drawnCard
    })
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterP2DrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player2.enableRevealHand).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P2 can now see their cards`)
    const gameStateAfterRevealingHand = handleRevealHand({
      gameId: 'test',
      whoIsPlaying: 'P2',
      whoseHandToReveal: 'P2'
    })
    expect(gameStateAfterRevealingHand.player2.hand[0]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player2.hand[1]).not.toBe('hidden')
    expect(gameStateAfterRevealingHand.player2.hand[2]).not.toBe('hidden')
    const gameStateAfterP2TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP2TurnEnds.player2.enableRevealHand).toBe(false)
    expect(gameStateAfterP2TurnEnds.message).toEqual(`P1's turn`)
    expect(gameStateAfterP2TurnEnds.nextTurn).toEqual('P1')
    expect(gameStateAfterP2TurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })
})

describe("J: Shuffling an opponent's cards", () => {
  test("P1 shuffling P2's cards", () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterDrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    gameStateAfterDrawingCard.drawnCard = { value: 'J', suit: 'Diamonds' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterDrawingCard.drawnCard
    })
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterDrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player2.enableShuffleCards).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P1 can now shuffle an opponent's cards`)
    const game = gamesMgr.getGame('test')
    console.log('Before shuffling: ', game.player2.hand.cards)
    const gameStateAfterShufflingCards = handleShuffleHand({
      gameId: 'test',
      whoIsPlaying: 'P1',
      whoseCardsToShuffle: 'P2'
    })
    console.log('After shuffling: ', game.player2.hand.cards)
    expect(gameStateAfterShufflingCards.specialCardMessage).toEqual(`P1 shuffled P2's cards`)
    const gameStateAfterTurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterTurnEnds.player2.enableShuffleCards).toBe(false)
    expect(gameStateAfterTurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterTurnEnds.nextTurn).toEqual('P2')
    expect(gameStateAfterTurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })

  test("P2 shuffling P1's cards", () => {
    handleNewGame({ gameId: 'test' })
    handleStartGame({ gameId: 'test' })
    const gameStateAfterP1DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P1' })
    handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P1',
      drawnCard: gameStateAfterP1DrawingCard.drawnCard
    })
    const gameStateAfterP1TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP1TurnEnds.message).toEqual(`P2's turn`)
    expect(gameStateAfterP1TurnEnds.nextTurn).toEqual('P2')

    const gameStateAfterP2DrawingCard = handleDrawCard({ gameId: 'test', whoIsPlaying: 'P2' })
    gameStateAfterP2DrawingCard.drawnCard = { value: 'J', suit: 'Diamonds' };
    const gameStateAfterDiscardingCard = handleDiscardDrawnCard({
      gameId: 'test',
      whoIsPlaying: 'P2',
      drawnCard: gameStateAfterP2DrawingCard.drawnCard
    })
    expect(gameStateAfterDiscardingCard.topDiscardCard).toEqual(gameStateAfterP2DrawingCard.drawnCard)
    expect(gameStateAfterDiscardingCard.player1.enableShuffleCards).toBe(true)
    expect(gameStateAfterDiscardingCard.specialCardMessage).toEqual(`P2 can now shuffle an opponent's cards`)
    const game = gamesMgr.getGame('test')
    console.log('Before shuffling: ', game.player1.hand.cards)
    const gameStateAfterShufflingCards = handleShuffleHand({
      gameId: 'test',
      whoIsPlaying: 'P2',
      whoseCardsToShuffle: 'P1'
    })
    console.log('After shuffling: ', game.player1.hand.cards)
    expect(gameStateAfterShufflingCards.specialCardMessage).toEqual(`P2 shuffled P1's cards`)
    const gameStateAfterP2TurnEnds = handleEndTurn({ gameId: 'test' })
    expect(gameStateAfterP2TurnEnds.player1.enableShuffleCards).toBe(false)
    expect(gameStateAfterP2TurnEnds.message).toEqual(`P1's turn`)
    expect(gameStateAfterP2TurnEnds.nextTurn).toEqual('P1')
    expect(gameStateAfterP2TurnEnds.specialCardMessage).toEqual(``)
    gamesMgr.removeGame('test')
  })
})

describe("Ending game and playing again", () => {
  test("", () => { })
})

describe("Clearing old games from memory", () => {})