import { Game } from './Game'

describe('Game over', () => {
  test('when deck is empty', () => {
    const game = new Game('test')
    game.deck = []
    expect(game.checkIfDeckIsEmpty()).toBe(true)
  })


  test('when game ends', () => {
    const game = new Game('test')
    game.endGame()
    expect(game.isGameOver).toBe(true)
    expect(game.nextTurn).toBe(null)
    expect(game.message).toBeOneOf(["It's a tie!", "P1 wins!", "P2 wins!"])
  })
})

describe('Deal', () => {
  test('when hands are dealt', () => {
    const game = new Game('test')
    expect(game.player1.hand.getCards().length).toBe(3)
    expect(game.player2.hand.getCards().length).toBe(3)
    expect(game.deck.getCards().length).toBe(52 - 6)
  })
})

describe('End turn', () => {
  test('next turn', () => {
    const game = new Game('test')
    expect(game.determineNextTurn('P1')).toBe('P2')
    expect(game.determineNextTurn('P2')).toBe('P1')
  })
})
