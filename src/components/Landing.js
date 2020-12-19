import React, { Component } from 'react';

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameId: ''
    };
    this.handleGameIdInputChange = this.handleGameIdInputChange.bind(this);
  }

  handleGameIdInputChange(event) {
    console.log('[hGIIC]:', event.target.value);
    this.setState({ gameId: event.target.value });
  }

  render() {
    return (
      <>
        <p>Play 3 Aces online across multiple devices on a shared board.
          To create a new game or join an existing game, enter a game identifier and click 'GO'.
        </p>
        <div style={{ width: "100%", display: 'flex', fontFamily: 'verdana', height: "48px" }}>
          <input
            type='text'
            onChange={this.handleGameIdInputChange}
            value={this.state.gameId}
            style={{
              width: "80%",
              height: "100%",
              fontSize: "24px",
              fontFamily: "verdana"
            }}
          />
          <a
            style={{
              width: "20%",
              textAlign: "center",
              textDecoration: "none",
            }}
            href={`/game/${this.state.gameId}`}
          >
            <button style={{
              width: "100%",
              height: "100%",
              border: "0",
              padding: "0",
              backgroundColor: "#00a989",
              color: "white",
              cursor: "pointer",
              fontSize: "24px",
              fontFamily: "verdana"
            }}>
              GO
            </button>
          </a>
        </div>
      </>
    );
  }

};

export default Landing;
