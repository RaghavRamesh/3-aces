
class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
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
    if (this.cards.length > 0) {
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
    this.setupNewGame(gameId);
  }

  setupNewGame(gameId) {
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
    this.message = 'All players can see their respective cards';
    this.specialCardMessage = '';
    this.lastInteraction = Date.now();
    this.swap = {
      swapInProgress: false,
      whoIsPlaying: null,
      opponent: null,
      cardOfSelfToSwap: null,
      whichCardOfOpponentToSwap: null,
      cardOfOpponentToSwap: null
    };
    this.hasGameStarted = false;
  }

  startGame() {
    this.resetRound()
    this.hasGameStarted = true;
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
      specialCardMessage: this.specialCardMessage,
      isGame: true,
      nextTurn: this.nextTurn,
      swapInProgress: this.swap.swapInProgress,
      topDiscardCard: this.discardPile.length > 0
        ? this.discardPile[this.discardPile.length - 1]
        : null,
      drawnCard: this.drawnCard,
      hasGameStarted: this.hasGameStarted
    }
  }

  deal() {
    for (let i = 0; i < 3; i++) {
      this.player1.hand.addCard(this.deck.draw());
      this.player2.hand.addCard(this.deck.draw());
    }
  }

  determineNextTurn(currentTurn) {
    return currentTurn === 'P1' ? 'P2' : 'P1'
  }

  shuffleHand(whoIsPlaying, whoseCardsToShuffle) {
    if (whoseCardsToShuffle === 'P1') {
      this.player1.hand.shuffle();
    } else if (whoseCardsToShuffle === 'P2') {
      this.player2.hand.shuffle();
    }
    this.specialCardMessage = `${whoIsPlaying} shuffled ${whoseCardsToShuffle}'s cards`;
  }

  revealHand(whoIsPlaying, whoseCardsToReveal) {
    if (whoseCardsToReveal === 'P1') {
      this.player1.hand.setFaceUp(true);
    } else if (whoseCardsToReveal === 'P2') {
      this.player2.hand.setFaceUp(true);
    }
    this.specialCardMessage = `${whoIsPlaying} has seen ${whoseCardsToReveal}'s cards`;
  }

  swapCardPart1(whoIsPlaying, whoseCardToSwap, whichCardOfOpponentToSwap) {
    this.swap.swapInProgress = true;
    this.swap.whoIsPlaying = whoIsPlaying;
    this.swap.opponent = whoseCardToSwap;
    this.swap.whichCardOfOpponentToSwap = whichCardOfOpponentToSwap;
    if (whoIsPlaying === 'P1' && whoseCardToSwap === 'P2') {
      this.swap.cardOfOpponentToSwap = this.player2.hand.cards[whichCardOfOpponentToSwap];
    } else if (whoIsPlaying === 'P2' && whoseCardToSwap === 'P1') {
      this.swap.cardOfOpponentToSwap = this.player1.hand.cards[whichCardOfOpponentToSwap];
    }
    this.specialCardMessage = 'Choose one of your cards to swap';
  }

  swapCardPart2(whoIsPlaying, whichCardOfSelfToSwap) {
    if (whoIsPlaying === 'P1' && this.swap.opponent === 'P2') {
      const cardOfSelf = this.player1.hand.cards[whichCardOfSelfToSwap];
      this.player2.hand.replaceCard(cardOfSelf, this.swap.whichCardOfOpponentToSwap);
      this.player1.hand.replaceCard(this.swap.cardOfOpponentToSwap, whichCardOfSelfToSwap);
    } else if (whoIsPlaying === 'P2' && this.swap.opponent === 'P1') {
      const cardOfSelf = this.player2.hand.cards[whichCardOfSelfToSwap];
      this.player1.hand.replaceCard(cardOfSelf, this.swap.whichCardOfOpponentToSwap);
      this.player2.hand.replaceCard(this.swap.cardOfOpponentToSwap, whichCardOfSelfToSwap);
    }
    this.specialCardMessage = `${whoIsPlaying} has replaced their card #${whichCardOfSelfToSwap + 1} with ${this.swap.opponent}'s card #${this.swap.whichCardOfOpponentToSwap + 1}`;
  }

  discard(whoIsPlaying, card) {
    this.discardPile.push(card);
    this.drawnCard = null;
    switch (card.value) {
      case 'J':
        if (whoIsPlaying === 'P1') {
          this.player2.enableShuffleCards = true;
        } else if (whoIsPlaying === 'P2') {
          this.player1.enableShuffleCards = true;
        }
        this.specialCardMessage = `${whoIsPlaying} can now shuffle an opponent's cards`
        break;
      case '10':
        if (whoIsPlaying === 'P1') {
          this.player2.enableRevealHand = true;
        } else if (whoIsPlaying === 'P2') {
          this.player1.enableRevealHand = true;
        }
        this.specialCardMessage = `${whoIsPlaying} can now see an opponent's cards`;
        break;
      case 'K':
        if (whoIsPlaying === 'P1') {
          this.player1.enableRevealHand = true;
        } else if (whoIsPlaying === 'P2') {
          this.player2.enableRevealHand = true;
        }
        this.specialCardMessage = `${whoIsPlaying} can now see their cards`;
        break;
      case 'Q':
        if (whoIsPlaying === 'P1') {
          this.player2.enableSwapCards = true;
        } else if (whoIsPlaying === 'P2') {
          this.player1.enableSwapCards = true;
        }
        this.specialCardMessage = `${whoIsPlaying} can now swap one of their cards with an opponent's card`
        break;
      default:
        break;
    }
  }

  resetRound() {
    this.swap = {
      swapInProgress: false,
      whoIsPlaying: null,
      opponent: null,
      cardOfSelfToSwap: null,
      cardOfOpponentToSwap: null,
      whichCardOfOpponentToSwap: null
    }
    this.player1.hand.setFaceUp(false)
    this.player2.hand.setFaceUp(false)
    this.player1.enableRevealHand = false;
    this.player1.enableShuffleCards = false;
    this.player1.enableSwapCards = false;
    this.player2.enableRevealHand = false;
    this.player2.enableShuffleCards = false;
    this.player2.enableSwapCards = false;
    this.specialCardMessage = '';
    this.setPlayerTurn(this.nextTurn);
  }

  setPlayerTurn(player) {
    this.message = `${player}'s turn`;
  }

  endTurn() {
    this.resetRound();
    if (this.checkIfDeckIsEmpty()) {
      this.endGame();
    } else {
      this.nextTurn = this.determineNextTurn(this.nextTurn);
      this.setPlayerTurn(this.nextTurn);
    }
  }

  endGame() {
    this.message = this.determineWinner();
    this.isGameOver = true;
    this.nextTurn = null;
  }

  draw() {
    this.drawnCard = this.deck.draw();
    this.message = 'You can either discard or replace with one of the cards in your hand';
    // enable hand cards for the player that's playing
    this.lastInteraction = Date.now()
  }

  keepInHand(whoIsPlaying, drawnCard, cardPosition) {
    this.drawnCard = null;
    let previousCardInHand;
    if (whoIsPlaying === 'P1') {
      previousCardInHand = this.player1.hand.replaceCard(drawnCard, cardPosition);
    } else if (whoIsPlaying === 'P2') {
      previousCardInHand = this.player2.hand.replaceCard(drawnCard, cardPosition);
    }
    this.message = `${whoIsPlaying} replaced their card #${cardPosition + 1} with the drawn card`
    this.discard(whoIsPlaying, previousCardInHand);
  }

  checkIfDeckIsEmpty() {
    return this.deck.cards.length === 0
  }

  determineWinner() {
    const player1HandValue = this.player1.hand.getValue();
    const player2HandValue = this.player2.hand.getValue();
    let result = "";
    if (player1HandValue > player2HandValue) {
      result = 'P2 wins!';
    } else if (player1HandValue < player2HandValue) {
      result = 'P1 wins!';
    } else {
      result = "It's a tie!"
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
