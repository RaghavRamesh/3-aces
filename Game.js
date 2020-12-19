
class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
  }

  repr() {
    return `${this.value} of ${this.suit}`;
  }

  getValue() {
    return this.value;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    ["Spades", "Clubs", "Hearts", "Diamonds"].forEach((suit) => {
      ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"].forEach((value) => {
        this.cards.push(new Card(suit, value));
      });
    });
    this.shuffle();
  }

  shuffle() {
    // Attribution: https://stackoverflow.com/a/2450976/3639087
    let currentIndex = this.cards.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  draw() {
    if (this.cards.length > 1) {
      return this.cards.pop();
    }
  }

  getCards() {
    return this.cards;
  }
}

class Hand {
  constructor() {
    this.cards = []
    this.faceUp = false;
    this.value = 0
  }

  setFaceUp(faceUp) {
    this.faceUp = faceUp;
  }

  getCards() {
    return this.faceUp ? this.cards : ['hidden', 'hidden', 'hidden']
  }

  addCard(card) {
    this.cards.push(card)
  }

  replaceCard(card, cardPosition) {
    const currentCard = this.cards[cardPosition];
    this.cards[cardPosition] = card;
    return currentCard;
  }

  calculateValue() {
    this.value = 0
    this.cards.forEach((card) => {
      if (card.value === "A") {
        this.value += 1;
      } else if (["J", "Q", "K"].includes(card.value)) {
        this.value += 10;
      } else {
        this.value += parseInt(card.value);
      }
    });
  }

  shuffle() {
    // Attribution: https://stackoverflow.com/a/2450976/3639087
    let currentIndex = this.cards.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  getValue() {
    this.calculateValue();
    return this.value;
  }
}

class Game {
  constructor(gameId) {
    console.log('[Game#constructor]');
    this.startNewGame(gameId);
  }

  startNewGame(gameId) {
    this.nextTurn = 'P1';
    this.isGameOver = false;
    this.gameId = gameId;
    this.drawnCard = null;
    this.player1 = {
      hand: new Hand(),
      enableRevealHand: true,
      enableShuffleCards: false,
      enableSwapCards: false,
    };
    this.player2 = {
      hand: new Hand(),
      enableRevealHand: true,
      enableShuffleCards: false,
      enableSwapCards: false,
    };
    this.discardPile = [];
    this.deck = new Deck();
    this.deal();
    this.message = '';
    this.lastInteraction = Date.now();
    this.swap = {
      swapInProgress: false,
      whoIsPlaying: null,
      opponent: null,
      cardOfSelfToSwap: null,
      cardOfOpponentToSwap: null
    }
  }

  getGameStateJSON() {
    const { hand: player1Hand, ...restOfPlayer1} = this.player1;
    const { hand: player2Hand, ...restOfPlayer2} = this.player2;
    return {
      player1: {
        hand: player1Hand.getCards(),
        ...restOfPlayer1
      },
      player2: {
        hand: player2Hand.getCards(),
        ...restOfPlayer2
      },
      isGameOver: this.isGameOver,
      gameId: this.gameId,
      deck: this.deck.getCards(),
      message: this.message,
      isGame: true,
      nextTurn: this.nextTurn,
      swapInProgress: this.swap.swapInProgress,
      topDiscardCard: this.discardPile.length > 0 ? [this.discardPile.length - 1] : null,
      drawnCard: this.drawnCard
    }
  }

  deal() {
    for (let i = 0; i < 3; i++) {
      this.player1.hand.addCard(this.deck.draw());
      this.player2.hand.addCard(this.deck.draw());
    }
    console.log('[Game#deal] player hands:', this.player1Hand, this.player2Hand);
  }

  determineNextTurn() {
    this.nextTurn = this.nextTurn === 'P1' ? 'P2' : 'P1'
  }

  shuffleHand(whoIsPlaying, whoseCardsToShuffle) {
    console.log('[Game#shuffle] whoIsPlaying:', whoIsPlaying, 'whoseCardsToShuffle:', whoseCardsToShuffle);
    if (whoseCardsToShuffle === 'P1') {
      console.log('[Game#shuffle] p1 hand before shuffling:', this.player1Hand);
      this.player1Hand.shuffle();
      console.log('[Game#shuffle] p1 hand after shuffling:', this.player1Hand);
    } else if (whoseCardsToShuffle === 'P2') {
      console.log('[Game#shuffle] p2 hand before shuffling:', this.player2Hand);
      this.player2Hand.shuffle();
      console.log('[Game#shuffle] p2 hand before shuffling:', this.player2Hand);
    }
    this.message = `${whoIsPlaying} shuffled ${whoseCardsToShuffle}'s cards`;
  }

  revealHand(whoIsPlaying, whoseCardsToReveal) {
    if (whoseCardsToReveal === 'P1') {
      this.player1.hand.setFaceUp(true);
    } else if (whoseCardsToReveal === 'P2') {
      this.player2.hand.setFaceUp(true);
    }
    if (whoIsPlaying === whoseCardsToReveal) {
      this.message = `${whoIsPlaying} can now see their cards`;
    } else {
      this.message = `${whoIsPlaying} can now see ${whoseCardsToReveal}'s cards`;
    }
  }

  swapCardPart1(whoIsPlaying, whichCardOfOpponentToSwap) {
    this.swap.swapInProgress = true;
    this.swap.whoIsPlaying = whoIsPlaying;
    if (whoIsPlaying === 'P1' && whoseCardToSwap === 'P2') {
      this.swap.cardOfOpponentToSwap = this.player2.hand.getCards()[whichCardOfOpponentToSwap];
    } else if (whoIsPlaying === 'P2' && whoseCardToSwap === 'P1') {
      this.swap.cardOfOpponentToSwap = this.player1.hand.getCards()[whichCardOfOpponentToSwap];
      this.swap.cardOfSelfToSwap = this.player2.hand.getCards()[whichCardOfSelfToSwap];
    }
    this.message = 'Choose one of your cards to swap.';
  }

  swapCardPart2(whoIsPlaying, whichCardOfSelfToSwap) {
    if (whoIsPlaying === 'P1' && this.swap.opponent === 'P2') {
      const cardOfSelf = this.player1.hand.getCards()[whichCardOfSelfToSwap];
      this.player2.hand.replaceCard(cardOfSelf, this.swap.cardOfOpponentToSwap);
      this.player1.hand.replaceCard(this.swap.cardOfOpponent, cardOfSelf);
    } else if (whoIsPlaying === 'P2' && this.swap.opponent === 'P1') {
      this.player1.hand.replaceCard(cardOfSelf, this.swap.cardOfOpponentToSwap);
      this.player2.hand.replaceCard(this.swap.cardOfOpponent, cardOfSelf);
    }
    this.message = `${whoIsPlaying} has replaced their card #${whichCardOfSelfToSwap + 1} with ${this.swap.opponent}'s card #${this.swap.cardOfOpponentToSwap + 1}`;
  }

  discard(whoIsPlaying, card) {
    this.discardPile.push(card);
    switch (card.value) {
      case 'J':
        if (whoIsPlaying === 'P1') {
          this.player2.enableShuffleCards = true;
        } else if (whoIsPlaying === 'P2') {
          this.player1.enableShuffleCards = true;
        }
        break;
      case '10':
        if (whoIsPlaying === 'P1') {
          this.player2.enableRevealHand = true;
        } else if (whoIsPlaying === 'P2') {
          this.player1.enableRevealHand = true;
        }
        break;
      case 'K':
        if (whoIsPlaying === 'P1') {
          this.player1.enableRevealHand = true;
        } else if (whoIsPlaying === 'P2') {
          this.player2.enableRevealHand = true;
        }
        break;
      case 'Q':
        if (whoIsPlaying === 'P1') {
          this.player2.enableSwapCards = true;
        } else if (whoIsPlaying === 'P2') {
          this.player1.enableSwapCards = true;
        }
        break;
      default:
        break;
    }
  }

  endTurn() {
    this.player1.hand.setFaceUp(false)
    this.player2.hand.setFaceUp(false)
    this.message = '';
    this.swap = {
      swapInProgress: false,
      whoIsPlaying: null,
      opponent: null,
      cardOfSelfToSwap: null,
      cardOfOpponentToSwap: null
    }
    if (this.checkIfDeckIsEmpty()) {
      this.endGame();
    } else {
      this.determineNextTurn();
    }
  }

  endGame() {
    this.message = this.determineWinner();
    this.isGameOver = true;
    this.nextTurn = null;
  }

  draw() {
    this.drawnCard = this.deck.draw();
    this.lastInteraction = Date.now();
  }

  keepInHand(whoIsPlaying, drawnCard, cardPosition) {
    if (whoIsPlaying === 'P1') {
      this.player1.drawnCard = null;
      const previousCardInHand = this.player1.hand.replaceCard(drawnCard, cardPosition);
      this.discard('P1', previousCardInHand);
    } else if (whoIsPlaying === 'P2') {
      this.player2.drawnCard = null;
      const previousCardInHand = this.player2.hand.replaceCard(drawnCard, cardPosition);
      this.discard('P2', previousCardInHand);
    }
  }

  checkIfDeckIsEmpty() {
    return this.deck.length === 0
  }

  determineWinner() {
    const player1HandValue = this.player1.hand.getValue();
    const player2HandValue = this.player2.hand.getValue();
    let result = "It's a tie!";
    if (player1HandValue > player2HandValue) {
      result = 'P2 wins!';
    } else if (player1HandValue < player2HandValue) {
      result = 'P1 wins!';
    }
    return result;
  }
}

class GamesManager {
  constructor() {
    this.games = new Map()
  }
  hasGame(gameId) {
    return this.games.has(gameId);
  }
  getGame(gameId) {
    return this.games.get(gameId);
  }
  addGame(game) {
    this.games.set(game.gameId, game);
  }
  removeGame(gameId) {
    this.games.delete(gameId);
  }
}

module.exports = {
  Game,
  GamesManager
};
