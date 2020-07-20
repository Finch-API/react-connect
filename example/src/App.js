import React from 'react'
import { useMyHook } from 'react-finch-connect'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App