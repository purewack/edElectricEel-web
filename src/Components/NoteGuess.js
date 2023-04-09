
export function newNote(notePool, currentNote){
    const generateNote = (avoid) => {
        let note;
        let dupe;
        do{
            dupe = false
            const r = Math.floor(Math.random()*100)
            note = notePool[r % notePool.length]
            for(let i=0; i<avoid.length; i++){
                if(avoid[i] === note) dupe = true
            }
        }while(dupe)
        return note
    }
    
    console.log('avoiding ',currentNote)
    const nt1 = generateNote([currentNote])
    console.log('got ',nt1)
    const nt2 = generateNote([currentNote,nt1])
    console.log('got2 ',nt2)
    return [nt1, nt2]
}

export function guessRange (guessData,toMidi){
    const notes = guessData.notes

    //find required midi range
    let root;
    let count;
    if(guessData.type === 'selection'){
      let low = toMidi(notes[0])
      let high = low;
      notes.forEach((n)=>{
        const note = toMidi(n)
        if(note < low) low = note
        else if(note > high) high = note
      })
      count = high-low+1
      root = low
    }
    else{
      const lowMidi = toMidi(notes[0]);
      const highMidi = toMidi(notes[1]);
      count = highMidi - lowMidi + 1
      root = lowMidi
    }
    return {root,count}
} 