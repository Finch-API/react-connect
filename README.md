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
    // payrollProvider: '<payroll-provider-id>',
    products: ['company', 'directory'],
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
