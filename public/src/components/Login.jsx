import React from 'react';
import { Button } from 'react-bootstrap';

const Login = (props) => {
  return (
    <div>
      <a href="/login">
        <Button
          className="btn btn-success"
        >
        Login
        </Button>
      </a>
    </div>
  );
};

export default Login;
