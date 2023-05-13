import '../Styles/Learn.css'
import { useContext, useEffect, useState } from "react"
import { MidiContext } from "../App"
import { getMidi } from '../Helpers/Hooks'
import { makeSelectionFromRangeNotes } from '../Helpers/Generators'
import NoteInput from '../Components/NoteInput'
import NoteView from '../Components/NoteView'
import { exampleRangeEasy, exampleRangeHard, exampleRangeMedium, exampleRangeTreble } from './SelectDifficulty'

export function HelpMidiOctaves(){
    const midiPlayer = useContext(MidiContext)
    return <div className="Help Note MidiOctave">
        <p>[midi] piano octave numbers start from C not from the note A.</p>
        <p><i>example:</i></p>
        <p>Middle C is C<b>4</b> but the key to the left of middle C is from the previous octave, so it will be B<b>3</b></p>
        <NoteInput root={getMidi('C3')} count={14} showRange={['B3','C4']} onNoteOff={(n)=>{midiPlayer.nodes.input.triggerAttackRelease(n,'4n')}}/>
    </div>
}

export function HelpNotes({clef,notesLine,notesSpace}){
    const [scroll,setScroll] = useState({value:0,move:false})

    return <NoteView stavesExtra={1} noBarStart noteNames={'no-octave'} 
            slide={scroll.value}
            data={[{
                clef, notes: notesLine
            },
            notesSpace ? {
                clef, notes: notesSpace
            } : null]}
            onPointerDown={(ev)=>{
                if(ev.buttons === 1)
                setScroll(s => {return {...s, move:true}})
            }}
            onPointerUp={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerLeave={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerCancel={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerMove={(ev)=>{
                if(scroll.move)
                setScroll(s => {return {...s,value: s.value - ev.movementX/16}})
            }}
        />
}

export function HelpNotesTreble(){
    return <HelpNotes clef={'treble'} notesLine={["E4","G4","B4","D5","F5"]} notesSpace={["F4","A4","C5","E5"]}/>
}
export function HelpNotesTrebleSummary(){
    return <div className="Help Note Treble">
        <p>The <b>Treble Clef's</b> low stave is the E note (E4) and top stave is F (F5)</p>
        <ul>
            <li>The notes on the lines are: E,G,B,D,F</li>
            <li>The notes in-beetween the lines are: F,A,C,E</li>
            <li>The Middle C on on ledger line lower than normal</li>
        </ul>
        <HelpNotesTreble />
        </div>
}

export function HelpNotesBass(){
    return <HelpNotes clef={'bass'} notesLine={["G2","B2","D3","F3","A3"]} notesSpace={["A2","C3","E3","G3"]}/>
}
export function HelpNotesBassSummary(){
    return <div className="Help Note Bass">
        <p>The <b>Bass Clef's</b> low stave is the G note (G2) and top stave is A (A3)</p>
        <ul>
            <li>The notes on the lines are: G,B,D,F,A</li>
            <li>The notes in-beetween the lines are: A,C,E,G</li>
            <li>The Middle C on on ledger line higher than normal</li>
        </ul>
        <HelpNotesBass />
    </div>
}

export function HelpNotesAlto(){
    return <HelpNotes clef={'alto'} notesLine={["F3","A3","C4","E4","G4"]} notesSpace={["G3","B3","D4","F4"]}/>
}
export function HelpNotesAltoSummary(){
    return <div className="Help Note Alto">
        <p>The <b>Alto Clef's</b> low stave is the F note (F3) and top stave is G (G4)</p>
        <ul>
            <li>The Middle C sits in the middle of the alto clef</li>
            <li>The notes on the lines are: F,A,C,E,G</li>
            <li>The notes in-beetween the lines are: G,B,D,F</li>
        </ul>
        <HelpNotesAlto/>
    </div>
}

export function HelpNotesMiddleCSummary(){
    return <div className="Help Note MiddleC">
        <p>The <b>Middle C</b> sits on these lines:</p>
        <NoteView stavesExtra={2} noteNames 
            data={[
                {clef:'treble', notes: ['C4']},
                {clef:'alto',   notes: ['C4']},
                {clef:'bass',   notes: ['C4']}
            ]} 
        />
    </div>
}


export function HelpGamePitchRange(){
    const [scroll,setScroll] = useState({value:-1.5,move:false})

    return <div className="Help Note GameRange">
        <p>Easy</p>
        <NoteView stavesExtra={2} noBarStart noteNames={'no-octave'}
            slide={scroll.value} 
            data={[{
                clef:'treble', notes: exampleRangeEasy
            }]}
            onPointerDown={(ev)=>{
                if(ev.buttons === 1)
                setScroll(s => {return {...s, move:true}})
            }}
            onPointerUp={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerLeave={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerCancel={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerMove={(ev)=>{
                if(scroll.move)
                setScroll(s => {return {...s,value: s.value - ev.movementX/16}})
            }}
        />
        <p>Medium</p>
        <NoteView stavesExtra={2} noBarStart noteNames={'no-octave'} 
            data={[{
                clef:'treble', notes: exampleRangeMedium
            }]}
            slide={scroll.value} 
            onPointerDown={(ev)=>{
                if(ev.buttons === 1)
                setScroll(s => {return {...s, move:true}})
            }}
            onPointerUp={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerLeave={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerCancel={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerMove={(ev)=>{
                if(scroll.move)
                setScroll(s => {return {...s,value: s.value - ev.movementX/16}})
            }}
        />
        <p>Hard</p>
        <NoteView stavesExtra={2} noBarStart noteNames={'no-octave'} 
            data={[{
                clef:'treble', notes: exampleRangeHard
            }]}
            slide={scroll.value} 
            onPointerDown={(ev)=>{
                if(ev.buttons === 1)
                setScroll(s => {return {...s, move:true}})
            }}
            onPointerUp={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerLeave={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerCancel={()=>{
                setScroll(s => {return {...s, move:false}})
            }}
            onPointerMove={(ev)=>{
                if(scroll.move)
                setScroll(s => {return {...s,value: s.value - ev.movementX/16}})
            }}
        />
    </div>
}


export default function Learn({onPresent, theme}){
    const midiPlayer = useContext(MidiContext)

    useEffect(()=>{
        midiPlayer.play(theme)
    },[])

    return <div className="Learn">
        <nav className="NavScreen">
            <button className='btn Back'
                onClick={()=>{
                        onPresent('/')
                }}>
                <span>Back</span> 
            </button>
            <h1>Learn</h1>
        </nav>
        
        <div className='Content'>
            <h1>Note ranges</h1>
            <h2>Common confusion</h2>
            <HelpMidiOctaves />
            <h3>Treble Notes</h3>
            <HelpNotesTrebleSummary />
            <h3>Bass Notes</h3>
            <HelpNotesBassSummary />
            <h3>Alto Notes</h3>
            <HelpNotesAltoSummary />
            
            <h3>Tips and game ranges</h3>
                <HelpNotesMiddleCSummary/>
                <p>For the pitch game, the preset note ranges are:</p>
                <HelpGamePitchRange />
        </div>
    </div>
}