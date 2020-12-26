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
    this.handleHandCardClick = this.handleHandCardClick.bind(this);
    this.handleShuffleCards = this.handleShuffleCards.bind(this);
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

  makeRequest(url, body) {
    this.setState({ loading: true })
    fetch(url, body)
      .then(response => response.json())
      .then(({ data }) => {
        this.updateGameState({ ...data, loading: false })
      })
      .catch((error) => {
        console.error("Error:", error)
        this.setState({ loading: false, message: error })
      })
  }

  handleHandCardClick(whichCard, whoseHand) {
    const {
      gameId,
      player,
      drawnCard,
      swapInProgress,
      player1,
      player2,
    } = this.state;
    const discarding = player === 'P1' ? player1.enableDiscardFromHand : player2.enableDiscardFromHand;
    if (discarding) {
      this.makeRequest('/api/keep-in-hand', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          gameId,
          whoIsPlaying: player,
          drawnCard,
          cardPosition: whichCard,
        })
      })
    } else if (swapInProgress) {
      this.makeRequest('/api/swap-card-part-2', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          gameId,
          whoIsPlaying: player,
          whichCardOfSelfToSwap: whichCard
        })
      })
    } else {
      this.makeRequest('/api/swap-card-part-1', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          gameId,
          whoIsPlaying: player,
          whoseCardToSwap: whoseHand,
          whichCardOfOpponentToSwap: whichCard
        })
      })
    }
  }

  handlePlayerChange(player) {
    this.setState({ player });
  }

  handleRevealHand(whoseHandToReveal) {
    this.makeRequest('/api/reveal-hand?' + new URLSearchParams({
      gameId: this.state.gameId,
      whoIsPlaying: this.state.player,
      whoseHandToReveal,
    }))
  }

  handleShuffleCards(whoseCardsToShuffle) {
    const { gameId, player } = this.state;
    this.makeRequest('/api/shuffle-hand', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId,
        whoIsPlaying: player,
        whoseCardsToShuffle
      })
    })
  }

  handleDiscardDrawnCard() {
    const { gameId, player, drawnCard } = this.state;
    this.makeRequest('/api/discard-drawn-card', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId,
        whoIsPlaying: player,
        drawnCard
      })
    })
  }

  handleDrawCard() {
    const { gameId, player } = this.state;
    this.makeRequest('/api/draw-card?' + new URLSearchParams({
      gameId,
      whoIsPlaying: player
    }))
  }

  handleStartGame() {
    this.makeRequest('/api/start-game', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId: this.state.gameId
      })
    })
  }

  handleEndTurn() {
    this.makeRequest('/api/end-turn', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        gameId: this.state.gameId
      })
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
      hasGameStarted,
      disableDrawing,
      disableEndTurn
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
              playerId='P1'
              hand={player1.hand}
              enableDiscardFromHand={player1.enableDiscardFromHand}
              handleHandCardClick={this.handleHandCardClick}
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
            handleEndTurn={this.handleEndTurn}
            message={message}
            nextTurn={nextTurn}
            topDiscardCard={topDiscardCard}
            drawnCard={drawnCard}
            disableDrawing={disableDrawing}
            disableEndTurn={disableEndTurn}
          />
          <div style={colStyle}></div>
          <div style={colStyle}></div>
          <div style={playerAreaStyle}>
            <PlayerHand
              playerId='P2'
              hand={player2.hand}
              enableDiscardFromHand={player2.enableDiscardFromHand}
              handleHandCardClick={this.handleHandCardClick}
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
