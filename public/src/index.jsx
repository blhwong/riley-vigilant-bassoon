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
    console.log(this.state.authenticated);
    axios.get('/auth')
    .then((results) => {
      this.setState({
        authenticated: results.data
      });
      if (this.state.authenticated) {
        console.log('getting messages');
        return axios.get('/messages');
      }
    })
    .then((results) => {
      console.log('success!', results);
      if (!!results) {
        this.setState({
          threads: results.data
        });
        let socket = io.connect('http://localhost:3000');
        socket.on('new-mail', (data) => {
          console.log('receive', data);
          this.setState({
            threads: data
          });
        });
      }
      console.log(this.state.threads);
    })
    .catch((err) => {
      console.error('err', err);
    });
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
