import React  from 'react'
import Landing from './Landing';
import Game from './Game';

const App = (props) => {
  return !props.isGame ? (
    <Landing />
  ) : (
    <Game {...props} />
  );
}

export default App;
