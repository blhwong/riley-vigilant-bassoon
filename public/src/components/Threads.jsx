import React from 'react';
import Snippet from './Snippet.jsx';
import { Table } from 'react-bootstrap';

const Threads = (props) => (
  <Table striped bordered condensed hover>
    <tbody>
      {props.threads.map((message, index) => {
        return <Snippet
                  message={message}
                  key={index}
                />;
      })}
    </tbody>
  </Table>
);

export default Threads;
