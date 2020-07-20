import React, { useState } from 'react';
import { useFinchConnect } from 'react-finch-connect';
import './App.css';

const App = () => {
  const [code, setCode] = useState(null);

  const onSuccess = ({ code }) => setCode(code);
  const onError = ({ errorMessage }) => console.error(errorMessage);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    clientId: '25ea8bd8-f76b-41f9-96e3-1e6162021c50',
    products: ['identity', 'employment', 'pay_statement', 'tax'],
    onSuccess,
    onError,
    onClose,
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>Code: {code}</p>
        <button type="button" onClick={() => open()}>
          Open Finch Connect
        </button>
      </header>
    </div>
  );
};
export default App;
