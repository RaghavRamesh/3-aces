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

