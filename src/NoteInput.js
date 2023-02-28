import './styles/PianoRoll.css'
import './styles/NoteInput.css'
import { useState } from 'react';
import { Frequency } from 'tone';

function PianoKey({index, whiteKey, noteSignal, children}){

    const [active, setActive] = useState(false);

    return (
        <button className={`${whiteKey ? 'PianoKey White' : 'PianoKey Black'} ${active ? 'Press' : ''}`} 
        onMouseEnter={(ev)=>{
            if(ev.buttons === 1 && !active){
                noteSignal(index,true)
                setActive(true)
            }
        }}
        onMouseDown={()=>{
            setActive(true)
            noteSignal(index,true)
        }} 
        onMouseUp={()=>{
            setActive(false)
            noteSignal(index,false)
        }}
        onMouseLeave={(ev)=>{
            if(ev.buttons === 1 && active){
                setActive(false)
                noteSignal(index,false)
            }
        }}>
            {children}
        </button>
    )
}

export default function NoteInput({synth}){
    const [octave, setOctave] = useState(4);

    const handleNoteSignal = (index,state)=>{
        const n = Frequency(index + octave*12, "midi").toFrequency();
        console.log({n,state})
        if(state)
            synth.triggerAttack(n)
        else
            synth.triggerRelease()
    }

    const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C']

    return(
        <div className='NoteInput'>
            {keys.map((key,index)=>{
                return <PianoKey 
                index={index} 
                whiteKey={!key.endsWith('#')}
                noteSignal={handleNoteSignal}> 
                    {key}
                </PianoKey>
            })}
        </div>
    )
}