import React, { useState } from 'react';
import { useFinchConnect, SuccessEvent, ErrorEvent } from '@tryfinch/react-connect';

import Result, { ResultContainer } from './Result';

import './App.css';

const App = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [sendState, setSendState] = useState<boolean>(false);
  const [result, setResult] = useState<ResultContainer>();

  // Define callbacks
  const onSuccess = (value: SuccessEvent) => setResult({ kind: 'success', value });
  const onError = (value: ErrorEvent) => setResult({ kind: 'error', value });
  const onClose = () => setResult({ kind: 'closed' });

  // Initialize the FinchConnect hook
  const { open } = useFinchConnect({
    onSuccess,
    onError,
    onClose,
  });

  // Call the open method when submitting the form
  const submissionHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    open({
      // Generate a session ID using the /connect/sessions endpoint on the Finch API
      // See the docs here https://developer.tryfinch.com/api-reference/connect/new-session#create-a-new-connect-session
      sessionId: sessionId.trim(),
      // An optional state parameter can be passed
      // https://datatracker.ietf.org/doc/html/rfc6749#section-10.12
      ...(sendState ? { state: new Date().toISOString() } : {}),
      // An optional value for the z-index of the Finch Connect iframe
      // Defaults to 999 if not provided
      // zIndex: 998,
    });
  };

  return (
    <div className="container">
      <h2>
        <a href="https://www.npmjs.com/package/@tryfinch/react-connect">@tryfinch/react-connect</a>{' '}
        Example App
      </h2>
      <form className="actions" onSubmit={submissionHandler}>
        <div className="row">
          <label className="top-label">Session UUID:</label>
          <input
            type="text"
            placeholder="Enter session UUID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
        </div>
        <div className="row">
          <label className="top-label">Include State:</label>
          <input
            type="checkbox"
            checked={sendState}
            onChange={() => setSendState((prev) => !prev)}
          />
        </div>
        <div className="row">
          <button className="cta" type="submit">
            Open Finch Connect
          </button>
        </div>
      </form>
      <div className="results">
        {!result && (
          <p>Complete a Finch Connect session and the success event will be displayed here</p>
        )}
        {result && <Result result={result} />}
      </div>
    </div>
  );
};
export default App;
