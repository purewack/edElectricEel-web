import './App.css';
import React, { useEffect, useState } from 'react';
import { Synth } from 'tone';

function App() {
  const [plonker, setPlonker] = useState(null);
  useEffect( ()=>{
    if(!plonker){
      const pp = new Synth().toDestination();
      pp.oscillator.type = "fmtriangle";
      setPlonker(pp);
    }
  },[plonker]);
  const plonk = (pp)=>{
    pp.triggerAttackRelease("C4","8n");
  }

  return (
    <div className="App">
      <button onClick={()=>plonk(plonker)}>
        Plonk!
      </button>
    </div>
  );
}

export default App;
