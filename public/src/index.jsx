import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      threads: [],
      authenticated: false
    };
  }

  render () {
    return (
      <div>
        Riley
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
