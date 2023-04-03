import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LevelChromaticOctave from './GameModes/levelChromaticOctave';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LevelChromaticOctave />
  </React.StrictMode>
);

