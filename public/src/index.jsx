import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Threads from './components/Threads.jsx';
import Login from './components/Login.jsx';
import io from 'socket.io-client';
import 'bootstrap/less/bootstrap.less';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      threads: [],
      authenticated: false
    };
  }

  componentDidMount() {
    axios.get('/auth')
    .then((results) => {
      this.setState({
        authenticated: results.data
      });
      if (this.state.authenticated) {
        return axios.get('/messages');
      }
    })
    .then((results) => {
      if (!!results) {
        this.setState({
          threads: results.data
        });
        let socket = io.connect('http://localhost:3000');
        socket.on('new-mail', (data) => {
          this.setState({
            threads: data
          });
        });
      }
    })
    .catch((err) => {
      console.error('err', err);
    });
  }

  render () {
    return (
      <div>
        Riley
        {this.state.authenticated ? <Threads threads={this.state.threads}/> : <Login />}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
