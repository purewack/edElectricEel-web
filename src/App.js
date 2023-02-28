import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [st, setSt] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={ ()=>setSt(st + 1) }>
          Hello {st}
        </button>
      </header>
    </div>
  );
}

export default App;
