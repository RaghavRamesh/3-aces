import React, { Component } from 'react';
import Title from './Title';
import Admin from './Admin';
import PlayerOptions from './PlayerOptions';
import PlayerHand from './PlayerHand';
import DeckArea from './DeckArea';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props
    };
    this.handleRevealHand = this.handleRevealHand.bind(this);
    this.handleShuffleCards = this.handleShuffleCards.bind(this);
    this.handleSwapCardPart1 = this.handleSwapCardPart1.bind(this);
    this.handleSwapCardPart2 = this.handleSwapCardPart2.bind(this);
    this.handleDiscardDrawnCard = this.handleDiscardDrawnCard.bind(this);
    this.handleDrawCard = this.handleDrawCard.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleEndTurn = this.handleEndTurn.bind(this);
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('game-state-update', ({ gameState }) => {
      this.updateGameState(gameState);
    })
  }

  updateGameState(data) {
    this.setState({ ...data });
  }

  handlePlayerChange(player) {
    this.setState({ player });
  }

  handleRevealHand(whoseHandToReveal) {
    this.setState({ loading: true })
    fetch('/api/reveal-hand?' + new URLSearchParams({
      gameId: this.state.gameId,
      whoIsPlaying: this.state.player,
      whoseHandToReveal,
    }))
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({
          ...data,
          loading: false
        })
      })
      .catch((error) => {
        console.error("Error:", error)
        this.setState({ loading: false, message: error })
      })
  }

  handleShuffleCards(whoseCardsToShuffle) {
    const {
      gameId,
      player
    } = this.state;
    this.setState({ loading: true })
    fetch('/api/shuffle-hand', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId,
        whoIsPlaying: player,
        whoseCardsToShuffle
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.error('Error:', error)
        this.setState({ loading: false, message: error })
      })
  }

  handleSwapCardPart1(whoseCardToSwap, whichCardOfOpponentToSwap) {
    const {
      gameId,
      player,
    } = this.state
    this.setState({ loading: true })
    fetch('/api/swap-card-part-1', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId,
        whoIsPlaying: player,
        whoseCardToSwap,
        whichCardOfOpponentToSwap
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.error('Error:', error)
        this.setState({ loading: false, message: error })
      })
  }

  handleSwapCardPart2(whichCardOfSelfToSwap) {
    const {
      gameId,
      player,
    } = this.state;
    this.setState({ loading: true })
    fetch('/api/swap-card-part-2', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId,
        whoIsPlaying: player,
        whichCardOfSelfToSwap,
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.error('Error:', error)
        this.setState({ loading: false, message: error })
      })
  }

  handleDiscardDrawnCard() {
    const {
      gameId,
      player,
      drawnCard
    } = this.state;
    this.setState({ loading: true })
    fetch('/api/discard-drawn-card', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId,
        whoIsPlaying: player,
        drawnCard
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.log('Error:', error);
        this.setState({ loading: false, message: error })
      })

  }

  handleDrawCard() {
    console.log('[handleDrawCard]');
    const {
      gameId,
      player
    } = this.state;
    this.setState({ loading: true })
    fetch('/api/draw-card?' + new URLSearchParams({
      gameId,
      whoIsPlaying: player
    }))
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.log('Error:', error);
        this.setState({ loading: false, message: error })
      })
  }

  handleStartGame() {
    this.setState({ loading: true })
    fetch('/api/start-game', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId: this.state.gameId
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.log('Error:', error);
        this.setState({ loading: false, message: error })
      })

  }

  handleEndTurn() {
    this.setState({ loading: true })
    fetch('/api/end-turn', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId: this.state.gameId
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.log('Error:', error);
        this.setState({ loading: false, message: error })
      })
  }

  render() {
    const {
      gameId,
      player,
      player1,
      player2,
      deck,
      message,
      nextTurn,
      swapInProgress,
      topDiscardCard,
      drawnCard,
      hasGameStarted
    } = this.state;

    const colStyle = {
      border: '1px solid red',
      minHeight: '200px'
    };
    const playerAreaStyle = {
      ...colStyle,
      display: 'grid',
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)"
    };

    return (
      <div
        style={{
          margin: 'auto',
          width: '90%'
        }}
      >
        <Title />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)"
        }}
        >
          <div style={colStyle}></div>
          <div style={playerAreaStyle}>
            <PlayerOptions
              playerName='Player 1'
              playerId='P1'
              enableRevealHand={player1.enableRevealHand}
              enableSwapCards={player1.enableSwapCards}
              enableShuffleCards={player1.enableShuffleCards}
              handleRevealHand={this.handleRevealHand}
              handleShuffleCards={this.handleShuffleCards}
            />
            <PlayerHand
              hand={player1.hand}
              handleSwapCardPart1={this.handleSwapCardPart1}
              handleSwapCardPart2={this.handleSwapCardPart2}
              swapInProgress={swapInProgress}
            />
          </div>
          <div style={colStyle}>
            <Admin gameId={gameId} player={player} handlePlayerChange={this.handlePlayerChange} />
          </div>
          <div style={colStyle}></div>
          <DeckArea
            deck={deck}
            handleDrawCard={this.handleDrawCard}
            handleDiscardDrawnCard={this.handleDiscardDrawnCard}
            handleStartGame={this.handleStartGame}
            hasGameStarted={hasGameStarted}
            endTurn={this.handleEndTurn}
            message={message}
            nextTurn={nextTurn}
            topDiscardCard={topDiscardCard}
            drawnCard={drawnCard}
          />
          <div style={colStyle}></div>
          <div style={colStyle}></div>
          <div style={playerAreaStyle}>
            <PlayerHand
              hand={player2.hand}
              handleSwapCardPart1={this.handleSwapCardPart1}
              handleSwapCardPart2={this.handleSwapCardPart2}
              swapInProgress={swapInProgress}
            />
            <PlayerOptions
              playerName='Player 2'
              playerId='P2'
              enableRevealHand={player2.enableRevealHand}
              enableSwapCards={player2.enableSwapCards}
              enableShuffleCards={player2.enableShuffleCards}
              handleRevealHand={this.handleRevealHand}
              handleShuffleCards={this.handleShuffleCards}
            />
          </div>
          <div style={colStyle}></div>
        </div>
      </div>
    );
  }
}

export default Game;
