import { 
    getMidi,
    getNote,
    toMidiArray,
    toNotesArray,
    respellPitch,
    respellPitches,
    makeSelectionFromRangeMidi,
    makeSelectionFromRangeNotes,
    enumerateRangePerClef,
    pickNoteFromPoolAvoid,
    getClefFromProbability
} from "../Helpers/Hooks";


test('convert midi to note C4',()=>{
    expect(getMidi('C4')).toBe(60)
})
test('convert note to midi 60',()=>{
    expect(getNote(60)).toBe('C4')
})
test('convert note to midi 61 as sharp',()=>{
    expect(getNote(61)).toBe('C#4')
})
test('convert note to midi 61 as flat',()=>{
    expect(getNote(61,'flat')).toBe('Db4')
})


test('to midi array [C4,C#4,E4]',()=>{
    expect(toMidiArray(['C4','C#4','E4'])).toEqual([60,61,64])
})
test('to notes array [64,61,60]',()=>{
    expect(toNotesArray([64,61,60])).toEqual(['E4','C#4','C4'])
})

test('respell single pitch C#->Db',()=>{
    expect(respellPitch('C#4','flat')).toBe('Db4')
})
test('respell single pitch Eb->D#',()=>{
    expect(respellPitch('Eb4','sharp')).toBe('D#4')
})

test('respell array pitches #->b',()=>{
    expect(respellPitches(['C#4','D#4'],'flat')).toEqual(['Db4','Eb4'])
    expect(respellPitches(['C4','C#4','D#4','E4'],'flat')).toEqual(['C4','Db4','Eb4','E4'])
})
test('respell array pitches b->#',()=>{
    expect(respellPitches(['Ab4','Gb4'],'sharp')).toEqual(['G#4','F#4'])
    expect(respellPitches(['C4','Ab4','Gb4','E4'],'sharp')).toEqual(['C4','G#4','F#4','E4'])
})
test('respell array pitches same #->#',()=>{
    expect(respellPitches(['C#4','D#4'],'sharp')).toEqual(['C#4','D#4'])
    expect(respellPitches(['C4','C#4','D#4','E4'],'sharp')).toEqual(['C4','C#4','D#4','E4'])
})
test('respell array pitches same b->b',()=>{
    expect(respellPitches(['Ab4','Gb4'],'flat')).toEqual(['Ab4','Gb4'])
    expect(respellPitches(['C4','Ab4','Gb4','E4'],'flat')).toEqual(['C4','Ab4','Gb4','E4'])
})

test('make array from range 60,64',()=>{
    expect(makeSelectionFromRangeMidi(60,64,false)).toEqual(['C4','D4','E4'])
    expect(makeSelectionFromRangeMidi(60,64,true)).toEqual(['C4','C#4','D4','D#4','E4'])
})

test('make array from range notes C4 - F4',()=>{
    expect(makeSelectionFromRangeNotes('C4','F4',false)).toEqual(['C4','D4','E4','F4'])
    expect(makeSelectionFromRangeNotes('C4','F4',true)).toEqual( ['C4','C#4','D4','D#4','E4','F4'])
})

test('enumerate for treble clefs range',()=>{
    expect(enumerateRangePerClef(['D5','E5','F5'])).toEqual({treble:3, alto:0, bass:0})
    expect(enumerateRangePerClef(['D5','D#5','E5','F5','F#5'])).toEqual({treble:5, alto:0, bass:0})
    expect(enumerateRangePerClef(['D5','Eb5','E5','F5','Gb5'])).toEqual({treble:5, alto:0, bass:0})
})

test('enumerate for bass clefs range',()=>{
    expect(enumerateRangePerClef(['D2','E2','F2'])).toEqual({treble:0, alto:0, bass:3})
    expect(enumerateRangePerClef(['D2','D#2','E2','F2','F#2'])).toEqual({treble:0, alto:0, bass:5})
    expect(enumerateRangePerClef(['D2','Eb2','E2','F2','Gb2'])).toEqual({treble:0, alto:0, bass:5})
})

test('enumerate for treble-alto clefs range',()=>{
    expect(enumerateRangePerClef(['G4','A4','B4','C5','D5'])).toEqual({treble:5, alto:4, bass:0})
    expect(enumerateRangePerClef(['C5','C#5','D5'])).toEqual({treble:3, alto:1, bass:0})
    expect(enumerateRangePerClef(['C5','Db5','D5'])).toEqual({treble:3, alto:1, bass:0})
})

test('enumerate for bass-alto clefs range',()=>{
    expect(enumerateRangePerClef(['B2','C3','D3'])).toEqual({treble:0, alto:2, bass:3})
    expect(enumerateRangePerClef(['B2','C3','C#3','D3'])).toEqual({treble:0, alto:3, bass:4})
    expect(enumerateRangePerClef(['B2','C3','Db3','D3'])).toEqual({treble:0, alto:3, bass:4})
})

test('enumerate for all clefs',()=>{
    expect(enumerateRangePerClef(makeSelectionFromRangeNotes('A2','E5'))).toEqual({treble:10, alto:15, bass:9})
})

test('enumerate scattered all clefs', ()=>{
    expect(enumerateRangePerClef(['D2','A3','F4','A5'])).toEqual({treble:2, alto:2, bass:2})
})

test('enumerate middle C', ()=>{
    expect(enumerateRangePerClef(['C4'])).toEqual({treble:1, alto:1, bass:0})
})