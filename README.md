# @tryfinch/react-connect

[![NPM](https://img.shields.io/npm/v/@tryfinch/react-connect)](https://www.npmjs.com/package/@tryfinch/react-connect)

## Install

```bash
npm install --save @tryfinch/react-connect
```

## Usage

```jsx
import React, { useState } from 'react';
import { useFinchConnect } from '@tryfinch/react-connect';

const App = () => {
  const [code, setCode] = useState(null);

  const onSuccess = ({ code }) => setCode(code);
  /**
   * @param {string} errorMessage - The error message
   * @param {'validation_error' | 'employer_error'} errorType - The type of error
   * - 'validation_error': Finch Connect failed to open due to validation error
   * - 'employer_connection_error': The errors employers see within the Finch Connect flow
   */
  const onError = ({ errorMessage, errorType }) => console.error(errorMessage, errorType);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    // Session ID is the result from the /connect/sessions API call. See the [doccumentation](https://developer.tryfinch.com/api-reference/connect/new-session#create-a-new-connect-session) about creating new connect sessions for further implementation details.
    sessionId: '<your-session-id>',
    // zIndex: 999,
    // state: null,
    onSuccess,
    onError,
    onClose,
  });

  return (
    <div>
      <header>
        <p>Code: {code}</p>
        <button type="button" onClick={() => open()}>
          Open Finch Connect
        </button>
      </header>
    </div>
  );
};
```
