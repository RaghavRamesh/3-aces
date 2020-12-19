import { Game, GamesManager } from './Game';

describe('GamesMgr', () => {
  test('addGame works as expected', () => {
    const gamesMgr = new GamesManager();
    const game = new Game('test');
    gamesMgr.addGame(game)
    const gameExists = gamesMgr.hasGame('test')
    expect(gameExists).toBe(true);
  });

  test('getGame returns correct game', () => {
    const gamesMgr = new GamesManager();
    const game = new Game('test');
    gamesMgr.addGame(game)
    const testGame = gamesMgr.getGame('test')
    expect(testGame.gameId).toBe('test')
  })

  test("removeGame removes game from GamesManager's games", () => {
    const gamesMgr = new GamesManager();
    const game = new Game('test');
    gamesMgr.addGame(game)
    gamesMgr.removeGame(game.gameId)
    expect(gamesMgr.hasGame(game.gameId)).toBe(false)
  })
})
