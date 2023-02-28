import './App.css';
import React, { useEffect, useState } from 'react';
import { Synth } from 'tone';
import NoteInput from './NoteInput';

function App() {
  const [plonker, setPlonker] = useState(null);

  return (<>
    <div className="App">
      { !plonker ? 
        <button onClick={()=>{
          if(plonker) return

          const pp = new Synth().toDestination();
          pp.oscillator.type = "fmtriangle";
          
          setPlonker(pp);
        }}>Start Tone.js</button>
      :
        <NoteInput synth={plonker}></NoteInput>
      }
    </div>
  </>);
}

export default App;
