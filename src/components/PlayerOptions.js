import React from 'react';

const PlayerOptions = (props) => {
  const {
    enableShuffleCards,
    enableRevealHand,
    handleRevealHand,
    handleShuffleCards,
    playerName,
    playerId
  } = props;
  // toggle show cards and hide cards
  const gridItemStyle = {
    height: '32px',
    width: '96px'
  }
  return (
    <>
      <label style={gridItemStyle}>{playerName}</label>
      <button
        style={gridItemStyle}
        onClick={() => {
          handleRevealHand(playerId)
        }}
        disabled={!enableRevealHand}
      >
        Show cards
      </button>
      <button
        style={gridItemStyle}
        disabled={!enableShuffleCards}
        onClick={() => {
          handleShuffleCards(playerId)
        }}
      >
        Shuffle cards
      </button>
    </>
  );
}

export default PlayerOptions;
