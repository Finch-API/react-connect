# react-finch-connect

>

[![NPM](https://img.shields.io/npm/v/react-finch-connect.svg)](https://www.npmjs.com/package/react-finch-connect) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-finch-connect
```

## Usage

```jsx
import React, { useState } from 'react';
import { useFinchConnect } from 'react-finch-connect';

const App = () => {
  const [code, setCode] = useState(null);

  const onSuccess = ({ code }) => setCode(code);
  const onError = ({ errorMessage }) => console.error(errorMessage);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    clientId: '<your-client-id>',
    // The below are only a few of Finch's product scopes, please check Finch's [documentation](https://developer.tryfinch.com/docs/reference/ZG9jOjMxOTg1NTI3-permissions) for the full list
    products: ['company', 'directory'],
    // Check Finch's [documentation](https://developer.tryfinch.com/docs/reference/96f5be9e0ec1a-providers) for the full list of payroll provider IDs
    // payrollProvider: '<payroll-provider-id>',
    // sandbox: false,
    // manual: false,
    // z-index: 999,
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
