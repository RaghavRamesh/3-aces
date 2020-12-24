import React from 'react';

const PlayerHand = ({ hand, enableSwapCards, enableDiscardFromHand, handleHandCardClick, playerId }) => {
  const cardStyle = {
    height: '120px',
    width: '90px'
  }
  const enableCards = enableDiscardFromHand || enableSwapCards;
  return (
    hand.map((card, index) => {
      return (
        <button
          key={index}
          style={cardStyle}
          disabled={!enableCards}
          onClick={() => { handleHandCardClick(index, playerId) }}
        >
          {card !== 'hidden' ? card.value : ''}
        </button>
      );
    })
  );
}

export default PlayerHand;
