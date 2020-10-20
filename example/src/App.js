import React, { useState } from 'react';
import { useFinchConnect } from 'react-finch-connect';
import './App.css';

const App = () => {
  const [code, setCode] = useState(null);

  const onSuccess = ({ code }) => setCode(code);
  const onError = ({ errorMessage }) => console.error(errorMessage);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    clientId: '<your-client-id>',
    // payrollProvider: '<payroll-provider-id>',
    products: ['company', 'directory', 'individual', 'employment'],
    mode: 'employer',
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
