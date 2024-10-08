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
    clientId: '<your-client-id>',
    // The below are only a few of Finch's product scopes, please check Finch's [documentation](https://developer.tryfinch.com/docs/reference/ZG9jOjMxOTg1NTI3-permissions) for the full list
    products: ['company', 'directory'],
    // Check Finch's [documentation](https://developer.tryfinch.com/docs/reference/96f5be9e0ec1a-providers) for the full list of payroll provider IDs
    // payrollProvider: '<payroll-provider-id>',
    // For `sandbox`, omit or use 'false' if in production. Use "finch" or "provider" for sandbox testing, depending on test plan. See Finch's [documentation](https://developer.tryfinch.com/implementation-guide/Test/Testing-Plan) for an overview of Finch and Provider sandboxes.
    // sandbox: false,
    // manual: false,
    // zIndex: 999,
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
