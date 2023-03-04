import './styles/PianoRoll.css'
import './styles/NoteInput.css'
import { useState, useEffect } from 'react';
import { Frequency } from 'tone';

function PianoKey({index, whiteKey, noteSignal, children}){

    const [active, setActive] = useState(false);

    return (
        <button 
        className={`${whiteKey ? 'PianoKey White' : 'PianoKey Black'} ${active ? 'Press' : ''}`} 
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
            <p>{children}</p>
        </button>
    )
}

export default function NoteInput({synth, requestNotesCount}){
    const [octave, setOctave] = useState(4);

    const handleNoteSignal = (index,state)=>{
        // console.log({n,state})
        if(state){
            const n = Frequency(index + octave*12, "midi").toFrequency();
            synth.triggerAttack(n)
        }
        else
            synth.triggerRelease()
    }

    const keys = ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';']
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C']
    const naturals = ['C','D','E','F','G','A','B','C']
    
    useEffect(() => {
        const handleDown = (ev)=>{
            keys.forEach((k,i) => {
                if(ev.key === k && !ev.repeat)
                    handleNoteSignal(i,true);
            })
        };
        const handleUp = (ev)=>{
            handleNoteSignal(0,false);
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
    
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, []);


    const [notesLeft, setNotesLeft] = useState(0)
    useEffect(()=>{
        if(notesLeft != requestNotesCount)
            setNotesLeft(requestNotesCount);
        else{
            
        }
    }, [requestNotesCount])

    return(
        <div className='NoteInput'>
            {notes.map((key,index)=>{
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