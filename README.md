# @tryfinch/react-connect

[![NPM](https://img.shields.io/npm/v/@tryfinch/react-connect)](https://www.npmjs.com/package/@tryfinch/react-connect)

## Install

```bash
npm install --save @tryfinch/react-connect
```

## Usage

See the example app at `example/src` for a functional example

```jsx
import React, { useState } from 'react';
import { useFinchConnect } from '@tryfinch/react-connect';

const App = () => {
  const [code, setCode] = useState(null);

  // Define callbacks

  /**
   * @param {string} code - The authorization code to exchange for an access token
   * @param {string?} state - The state value that was provided when launching Connect
   */
  const onSuccess = ({ code, state }) => setCode(code);
  /**
   * @param {string} errorMessage - The error message
   * @param {'validation_error' | 'employer_error'} errorType - The type of error
   *    - 'validation_error': Finch Connect failed to open due to validation error
   *    - 'employer_connection_error': The errors employers see within the Finch Connect flow
   */
  const onError = ({ errorMessage, errorType }) => console.error(errorMessage, errorType);
  const onClose = () => console.log('User exited Finch Connect');

  // Initialize the FinchConnect hook
  const { open } = useFinchConnect({
    onSuccess,
    onError,
    onClose,
  });

  // Generate a session ID using the /connect/sessions endpoint on the Finch API
  // See the docs here https://developer.tryfinch.com/api-reference/connect/new-session#create-a-new-connect-session
  const sessionId = '';

  return (
    <div>
      <header>
        <p>Code: {code}</p>
        <button type="button" onClick={() => open({ sessionId })}>
          Open Finch Connect
        </button>
      </header>
    </div>
  );
};
```
