import React, { useState } from 'react';
import { useFinchConnect, SuccessEvent, ErrorEvent } from '@tryfinch/react-connect';

import './App.css';

const App = () => {
  const [sendState, setSendState] = useState<boolean>(false);
  const [successEvent, setSuccessEvent] = useState<SuccessEvent>();

  const onSuccess = (e: SuccessEvent) => setSuccessEvent(e);
  const onError = ({ errorMessage }: ErrorEvent) => console.error(errorMessage);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    clientId: 'c90b78c6-2151-4ca3-8fea-ccb708ffc5d9',
    products: ['company', 'directory', 'individual', 'employment'],
    sandbox: true,
    // payrollProvider: '<payroll-provider-id>',
    onSuccess,
    onError,
    onClose,
  });

  const openFinchConnectClickHandler = () => open({
    ...(sendState ? { state: new Date().toISOString() } : undefined),
  });

  return (
    <div className="container">
      <h2><a href="https://www.npmjs.com/package/@tryfinch/react-connect">@tryfinch/react-connect</a> Example App</h2>
      <form className="actions">
        <div className="row">
          <label className="top-label">Include State:</label>
          <input type="checkbox" checked={sendState} onChange={() => setSendState(prev => !prev)} />
        </div>
        <div className="row">
          <button className="cta" type="button" onClick={openFinchConnectClickHandler}>
            Open Finch Connect
          </button>
        </div>
      </form>
      <div className="results">
          { !successEvent && <p>Complete Finch Connect and the Results will be displayed here</p> }
          { successEvent && <>
            <p>Results:</p>
            <pre>{ JSON.stringify(successEvent, null, 2) }</pre>
          </> }
      </div>
        
    </div>
  );
};
export default App;
