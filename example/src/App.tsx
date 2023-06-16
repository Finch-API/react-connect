import React, { useState } from 'react';
import { useFinchConnect, SuccessEvent, ErrorEvent } from '@tryfinch/react-connect';

import Result, { ResultContainer } from './Result';

import './App.css';

const App = () => {
  const [sendState, setSendState] = useState<boolean>(false);
  const [result, setResult] = useState<ResultContainer>();

  const onSuccess = (value: SuccessEvent) => setResult({ kind: 'success', value });
  const onError = (value: ErrorEvent) => setResult({ kind: 'error', value });
  const onClose = () => setResult({ kind: 'closed' });

  const { open } = useFinchConnect({
    clientId: '<your-client-id>',
    products: ['company', 'directory', 'individual', 'employment'],
    // sandbox: false,
    // payrollProvider: '<payroll-provider-id>',
    onSuccess,
    onError,
    onClose,
  });

  const submissionHandler: React.FormEventHandler<HTMLFormElement>  = (e) => {
    e.preventDefault();
    open({
      ...(sendState ? { state: new Date().toISOString() } : undefined),
    })
  };

  return (
    <div className="container">
      <h2><a href="https://www.npmjs.com/package/@tryfinch/react-connect">@tryfinch/react-connect</a> Example App</h2>
      <form className="actions" onSubmit={submissionHandler}>
        <div className="row">
          <label className="top-label">Include State:</label>
          <input type="checkbox" checked={sendState} onChange={() => setSendState(prev => !prev)} />
        </div>
        <div className="row">
          <button className="cta" type="submit">
            Open Finch Connect
          </button>
        </div>
      </form>
      <div className="results">
          { !result && <p>Complete a Finch Connect session and the success event will be displayed here</p> }
          { result && <Result result={result} /> }
      </div>
    </div>
  );
};
export default App;
