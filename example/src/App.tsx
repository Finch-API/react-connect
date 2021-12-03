import React, { useState } from 'react';
import { useFinchConnect, SuccessEvent, ErrorEvent } from 'react-finch-connect';
import './App.css';

const App = () => {
  const [code, setCode] = useState<string>();

  const onSuccess = ({ code }: SuccessEvent) => setCode(code);
  const onError = ({ errorMessage }: ErrorEvent) => console.error(errorMessage);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    clientId: '<your-client-id>',
    products: ['company', 'directory', 'individual', 'employment'],
    // sandbox: false,
    // payrollProvider: '<payroll-provider-id>',
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
