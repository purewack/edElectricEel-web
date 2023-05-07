import { 
  getMidi,
  getRandomFrom, 
  makeSelectionFromRangeNotes,
  probability,
  respellPitch,
  respellPitches 
} from "./Hooks";

export function generateNoteWithAvoid(pool,avoid){
  let note;
  let dupe;
  do{
      dupe = false
      note = getRandomFrom(pool)
      for(let i=0; i<avoid.length; i++){
          if(avoid[i] === note) dupe = true
      }
  }while(dupe)
  return note
}

export function generateClef(clefs){
  const cc = clefs
  const trebleWeight = cc.treble ? cc.treble : 0
  const altoWeight = cc.alto ? cc.alto : 0
  const bassWeight = cc.bass ? cc.bass : 0

  let clefPool = []
  for(let i=0; i<Math.trunc(trebleWeight*100); i++)
    clefPool.push(0)
  for(let i=0; i<Math.trunc(altoWeight*100); i++)
    clefPool.push(1)
  for(let i=0; i<Math.trunc(bassWeight*100); i++)
    clefPool.push(2)

  // console.log(clefPool)

  const rng = getRandomFrom(clefPool)
  if(rng === 0) return 'treble'
  if(rng === 1) return 'alto'
  if(rng === 2) return 'bass'
}

export const generateNewGuessPitch2 = (currentNote, guessData)=>{

  const clef = generateClef(guessData.clefs)
  let pool = guessData.notes
  let avoidNote = currentNote !== undefined ? currentNote : pool[0]
  if(clef === 'treble'){
    pool = pool.filter(n => getMidi(n) >= getMidi('C4'))
  }
  else if(clef === 'alto'){
    pool = pool.filter(n => getMidi(n) >= getMidi('C3') && getMidi(n) <= getMidi('C5'))
  }
  else if(clef === 'bass'){
    pool = pool.filter(n => getMidi(n) <= getMidi('C4'))
  }

  if(guessData.type === 'range')
    pool = makeSelectionFromRangeNotes(pool[0],pool[1],guessData.accidentalPreference)
  if(guessData.accidentalPreference === 'both'){
    const p = Math.random() > 0.5 ? 'flats' : 'sharps'
    pool = respellPitches(pool, p)
    avoidNote = respellPitch(avoidNote, p)
  }
  else if(guessData.accidentalPreference === 'flat'){
    pool = respellPitches(pool,'flats')
    avoidNote = respellPitch(avoidNote,'flats')
  }
  
  const note1 = generateNoteWithAvoid(pool,[avoidNote])
  const note2 = generateNoteWithAvoid(pool,[avoidNote,note1])

  return {
    notes:[note1,note2],
    clef,
    avoidNote
  }
}