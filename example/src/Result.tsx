import { SuccessEvent, ErrorEvent } from '@tryfinch/react-connect';

export type ResultContainer = {
  kind: 'success';
  value: SuccessEvent;
} | {
  kind: 'error';
  value: ErrorEvent; 
} | {
  kind: 'closed', 
};

const Result = ({ result }: { result: ResultContainer }) => {
  if (result.kind === 'closed') {
    return <>
      <p>Closed!</p>
    </>;
  }

  return <>
    <p>{ result.kind === 'error' ? 'Error' : 'Success' }:</p>
    <pre>{ JSON.stringify(result.value, null, 2) }</pre>
  </>;
};

export default Result
