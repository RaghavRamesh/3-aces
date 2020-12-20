import React from 'react';

const DeckArea = (props) => {
  const deckAreaStyle = {
    border: '1px solid red',
    minHeight: '200px',
    display: 'grid',
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(4, 1fr)"
  }
  const cardStyle = {
    height: '120px',
    width: '90px',
    border: '1px solid black'
  }
  const {
    nextTurn,
    message,
    topDiscardCard,
    drawnCard,
    handleEndTurn,
    handleDiscardDrawnCard,
    handleDrawCard,
    hasGameStarted
  } = props;
  return (
    <div style={deckAreaStyle}>
      <label style={{
        'gridColumnStart': 1,
        'gridColumnEnd': 5
      }}>
        {`${nextTurn}'s turn`}
      </label>
      <div style={{
        'gridColumnStart': 1,
        'gridColumnEnd': 4
      }}>
        <button style={cardStyle} onClick={handleDrawCard}>Deck</button>
        <button
          style={cardStyle}
          onClick={handleDiscardDrawnCard}
        >
          {drawnCard ? drawnCard.value : ''}
        </button>
        <button disabled style={cardStyle}>{topDiscardCard ? topDiscardCard.value : null}</button>
      </div>
      <div style={{
        gridColumnStart: '1',
        gridColumnEnd: '3'
      }}>
        <label>{`${message}`}</label>
        {hasGameStarted ? (
          <button onClick={handleEndTurn}>End turn</button>
        ) : (
          <button onClick={handleStartGame}>Start game</button>
        )}
      </div>
    </div>
  );
}

export default DeckArea;