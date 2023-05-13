import { 
  getMidi,
  respellPitch,
  respellPitches,
  getRandomFromWithAvoid,
  getRandomFrom,
} from "./Hooks";

import {
  getClefFromProbability,
  makeSelectionFromRangeNotes
} from './Generators'

export const generateNewGuessPitch2 = (guessData = {
    type:'range', 
    notes:['C4','E4'],
    clefs:{treble:1, alto:0, bass:0},
    avoidNote:'C4'
})=>{
  /*
  1. condition the pool if should be a range
  2. pull out the note to avoid from pool
  3. respell to accidental preference
  4. split ranges per clef
  5. generate clef from prob.
  6. 
  */
  //{"type":"range","notes":["B3","E4"], "clefs":{"treble":0.5,"bass":0.5}, "avoidNote":"C4"}

  let pool = guessData.notes

  if(guessData.type === 'range')
    pool = makeSelectionFromRangeNotes(pool[0],pool[1],guessData.accidentalPreference)
  // console.log('pool init ',JSON.stringify(pool))

  if(pool.length < 3) 
    throw new Error('minimum of 3 notes to choose from required')
  
  let avoidNote = guessData.avoidNote !== undefined ? guessData.avoidNote : pool[0]
  pool = pool.filter(n => n !== avoidNote)
  // console.log('pool avoid filter ',JSON.stringify(pool))

  if(guessData.accidentalPreference === 'both'){
    const p = Math.random() > 0.5 ? 'flats' : 'sharps'
    pool = respellPitches(pool, p)
    avoidNote = respellPitch(avoidNote, p)
  }
  else if(guessData.accidentalPreference === 'flat'){
    pool = respellPitches(pool,'flats')
    avoidNote = respellPitch(avoidNote,'flats')
  }
  // console.log('pool respell ',JSON.stringify(pool))

  const bassPool = pool.filter(n => getMidi(n) < getMidi('C4'))
  const altoPool = pool.filter(n => getMidi(n) >= getMidi('C3') && getMidi(n) <= getMidi('C5'))
  const treblePool = pool.filter(n => getMidi(n) >= getMidi('C4'))
  const pools = {treble: treblePool, alto:altoPool, bass:bassPool}

  let clefs = {...guessData.clefs}

  // console.log('clefs init ',JSON.stringify(clefs))

  if(treblePool.length < 1)
    clefs.treble = 0
  else if(altoPool.length < 1)   
    clefs.alto = 0
  else if(bassPool.length < 1)
    clefs.bass = 0

  // console.log('clefs avoid 1 ',JSON.stringify(clefs))

  const clefA = getClefFromProbability(clefs)
  const noteA = getRandomFrom(pools[clefA])


  // console.log('guess 1 ',JSON.stringify({clefA,noteA}))

  if(clefA === 'treble' && treblePool.length <= 1)
    clefs.treble = 0
  else if(clefA === 'alto' && altoPool.length <= 1)   
    clefs.alto = 0
  else if(clefA === 'bass' && bassPool.length <= 1)
    clefs.bass = 0

  // console.log('clefs avoid 2 ',JSON.stringify(clefs))

  const clefB = getClefFromProbability(clefs)
  const noteB = getRandomFromWithAvoid(pools[clefB],[noteA])

  // console.log('guess 2 ',JSON.stringify({clefB,noteB}))

  if(!noteA || !noteB) 
    throw new Error('generated null note')

  const ret = {
    notes:[noteA,noteB],
    clefs:[clefA,clefB],
    avoidNote: avoidNote,
  }

  console.log(ret)
  return ret
}