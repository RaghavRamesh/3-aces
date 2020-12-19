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
  return (
    <>
      <label>{playerName}</label>
      <button
        onClick={() => {
          handleRevealHand(playerId)
        }}
        disabled={!enableRevealHand}
      >
        Show cards
      </button>
      <button
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
