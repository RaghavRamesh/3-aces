import React from 'react';

const Admin = ({ gameId, handleNewGameClick, handlePlayerChange, player }) => {
  return (
    <>
      <button onClick={handleNewGameClick}>New Game</button>
      <p
        style={{
          fontFamily: 'verdana',
          fontSize: '12px',
          color: '#888'
        }}
      >
        {typeof(window) != 'undefined' ? (
          <>
            Send this link to your opponent:{' '}
            <a
              href={`${window.location.protocol}//${window.location.host}/game/${gameId}`}
            >
              {`${window.location.protocol}//${window.location.host}/game/${gameId}`}
            </a>
          </>
        ) : (
          <>Loading...</>
        )}
      </p>
      <button>Game rules</button>
      <input
        type='radio'
        onChange={(e) => {
          handlePlayerChange(e.target.value)
        }}
        id='p1-button'
        value='P1'
        name='player'
        checked={player === 'P1'}
      />
      <label htmlFor="p1-button">P1</label>
      <input
        type='radio'
        onChange={(e) => {
          handlePlayerChange(e.target.value)
        }}
        id='p2-button'
        value='P2'
        name='player'
        checked={player === 'P2'}
      />
      <label htmlFor="p2-button">P2</label>
    </>
  )
}

export default Admin;
