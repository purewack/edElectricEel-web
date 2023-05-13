import { getRandomFrom, getMidi, getNote, noAccidentals } from "./Hooks";

export function getClefFromProbability(clefs){
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


export function makeSelectionFromRangeMidi(minMidi, maxMidi, accidental){
    const len = Math.trunc(maxMidi-minMidi+1)
    const range = [...Array(len)].map((e,i) => {
        return getNote(minMidi + i)
    })
    return accidental ? range : noAccidentals(range)
  }
  
  export function makeSelectionFromRangeNotes(minNote, maxNote, accidental){
      const lowMidi = getMidi(minNote);
      const highMidi = getMidi(maxNote);
      const count = highMidi - lowMidi + 1
      const root = lowMidi
      const guessRange = [...Array(count)].map((e,i)=> getNote(i+root))
      return accidental ? guessRange : noAccidentals(guessRange)
  }
  
  export function findSelectionLimits(selection){
    let low = getMidi(selection[0])
    let high = low;
    selection.forEach((n)=>{
      const note = getMidi(n)
      if(note < low) low = note
      else if(note > high) high = note
    })
    const count = high-low+1
    return{low,high,count}
  }
  
  
  export function enumerateRangePerClef(range){
    let counts = {
      treble: 0,
      alto: 0,
      bass: 0
    }
  
    const altoStart = getMidi('C3')
    const trebleBassPivot = getMidi('C4')
    const altoEnd = getMidi('C5')
  
    range.forEach(note=>{
      const midi = getMidi(note)
      if(midi < trebleBassPivot){
        counts.bass += 1
      }
      if(midi >= trebleBassPivot){
        counts.treble += 1
      }
      if(midi >= altoStart && midi <= altoEnd){
        counts.alto += 1
      }
    })
  
    return counts
  }
  
  
  export function enumerateRangePerClefOverlap(range){
    let counts = {
      treble: 0,
      alto: 0,
      bass: 0
    }
  
    const altoStart = getMidi('C3')
    const treblEnd = getMidi('C4')
    const bassStart = getMidi('E4')
    const altoEnd = getMidi('C5')
  
    range.forEach(note=>{
      const midi = getMidi(note)
      if(midi <= bassStart){
        counts.bass += 1
      }
      if(midi >= treblEnd){
        counts.treble += 1
      }
      if(midi >= altoStart && midi <= altoEnd){
        counts.alto += 1
      }
    })
  
    return counts
  }