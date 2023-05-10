import { 
  getMidi,
  respellPitch,
  respellPitches,
  enumerateRangePerClef,
  makeSelectionFromRangeNotes,
  enumerateRangePerClefExtended
} from "./Hooks";

import {
  getClefFromProbability,
  pickNoteFromPoolAvoid
} from './Generators'

export const generateNewGuessPitch2 = (currentNote, guessData)=>{

  let pool = guessData.notes
  let fallback = undefined
  
  if(guessData.type === 'range')
    pool = makeSelectionFromRangeNotes(pool[0],pool[1],guessData.accidentalPreference)

  let clef = getClefFromProbability(guessData.clefs)
  {
    const clefRanges = enumerateRangePerClefExtended(pool)
    if(clef === 'bass' && clefRanges.bass >= 3){
      pool = pool.filter(n => getMidi(n) < getMidi('C4'))
    }
    else if(clef === 'alto' && clefRanges.alto >= 3){
      pool = pool.filter(n => getMidi(n) >= getMidi('C3') && getMidi(n) <= getMidi('C5'))
    }
    else if(clef === 'treble' && clefRanges.treble >= 3){
      pool = pool.filter(n => getMidi(n) >= getMidi('C4'))
    }
    //emergency case, should not normally be called if data is preconditioned correctly
    else {
      pool = makeSelectionFromRangeNotes('C4','E4')
      clef = 'treble'
      fallback = true
    }
  }


  let avoidNote = currentNote !== undefined ? currentNote : pool[0]
  
  if(guessData.accidentalPreference === 'both'){
    const p = Math.random() > 0.5 ? 'flats' : 'sharps'
    pool = respellPitches(pool, p)
    avoidNote = respellPitch(avoidNote, p)
  }
  else if(guessData.accidentalPreference === 'flat'){
    pool = respellPitches(pool,'flats')
    avoidNote = respellPitch(avoidNote,'flats')
  }
  
  const note1 = pickNoteFromPoolAvoid(pool,[avoidNote])
  const note2 = pickNoteFromPoolAvoid(pool,[avoidNote,note1])

  return {
    notes:[note1,note2],
    clef,
    avoidNote,
    fallback
  }
}