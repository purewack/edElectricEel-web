import './App.css';
import React, { useState, useRef } from 'react';
import { Synth } from 'tone';
import NoteInput from './NoteInput';
import NoteView from './NoteView';

function App() {
const [plonker, setPlonker] = useState(null);

const defTestData = [
  {
    clef: "treble",
    key: 7,
    meter: [4, 4],
    notes: [
      "8n-b4",
      "?-?",
      "8n-a3",
      "8n-b3",
      "8n-c4",
      "8n-d4",
      "8n-e4",
      "8n-f4",
      "8n-g4",
      "8n-a4",
      "8n-b4",
      "8n-c5",
      "8n-d5",
      "8n-e5",
      "8n-f5",
      "8n-g5",
      "8n-a5",
      "8n-b5",
      "8n-c6",
      "8n-d6",
      "8n-e6",
      "8n-e6"
    ]
  },
  {
    notes: ["8n-d4", "8n-g#4", "8n-e4", "8n-gb4"]
  },
  {
    notes: [
      "16n-r",
      "8n-r",
      "4n-r",
      "2n-r",
      "1n-r",
      "16n-b4",
      "8n-b4",
      "4n-b4",
      "2n-b4",
      "1n-b4"
    ]
  },
  {
    clef: "alto",
    meter: [6, 8],
    key: -7,
    notes: ["2n-g4"]
  }
];
const [testData, setTestData] = useState(defTestData);

const [debug, setDebug] = useState(false);
const [slide, setSlide] = useState(0);
const slider = useRef(null);
const noteViewStyle = {
  width: "100vh",
  height: "min(33vh,8rem)",
  height: "70vh",
  backgroundColor: "ivory",
  border: "black dashed 4px"
};

return (
  <div className="App">
    { !plonker ? 
        <button onClick={()=>{
          if(plonker) return

          const pp = new Synth().toDestination();
          pp.oscillator.type = "fmtriangle";
          
          setPlonker(pp);
        }}>Start Tone.js</button>
      : 
      <>
        <NoteView
        showDebug={debug}
        data={testData}
        slide={slide}
        stavesExtra={4}
        style={noteViewStyle}
      />
      {/* <NoteView
        data={[{ clef: "treble", key: 2, notes: ["8n g#3"] }]}
        style={noteViewStyle}
      /> */}
      <button
        onClick={() => {
          setDebug(!debug);
        }}
      >
        Show Debug
      </button>
      <input
        onChange={(ev) => {
          setSlide(ev.target.value);
        }}
        ref={slider}
        id="typeinp"
        type="range"
        min="0"
        max="200"
        defaultValue="0"
        step="1"
      />

      <button
        onClick={() => {
          slider.current.value = 0;
          setSlide(0);
          setTestData(defTestData);
        }}
      >
        Init Test Data
      </button>
      <button
        onClick={() => {
          slider.current.value = 0;
          setSlide(0);
          setTestData([]);
        }}
      >
        Clear
      </button>
      <button
        onClick={() => {
          setTestData([...testData, { notes: ["4n-b4", "2n-c4", "?-?"] }]);
        }}
      >
        Add bar
      </button>

      <NoteInput synth={plonker}></NoteInput>
    </>}
  </div>
);
  
}

export default App;
