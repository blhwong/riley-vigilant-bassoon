import React from 'react';
import Snippet from './Snippet.jsx';
import { Table } from 'react-bootstrap';
import './Threads.css';

const Threads = (props) => (
  <Table className="table" striped bordered condensed hover>
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
