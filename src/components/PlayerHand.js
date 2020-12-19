import React from 'react';

const PlayerHand = ({ hand, enableSwapCards }) => {
  const cardStyle = {
    height: '120px',
    width: '90px'
  }
  return (
    hand.map((card, index) => {
      return (
        <button
          key={index}
          style={cardStyle}
          disabled={!enableSwapCards}
        >
          {card !== 'hidden' ? card.value : ''}
        </button>
      );
    })
  );
}

export default PlayerHand;
