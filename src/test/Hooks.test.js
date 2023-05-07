import { 
    getMidi,
    getNote,
    makeSelectionFromRangeMidi,
    makeSelectionFromRangeNotes,
    probability,
    respellPitch,
    respellPitches,
    toMidiArray,
    toNotesArray,
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


test('toMidiArray [C4,C#4,E4]',()=>{
    expect(toMidiArray(['C4','C#4','E4'])).toEqual([60,61,64])
})
test('toNotesArray [64,61,60]',()=>{
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


test('probability 0 false',()=>{
    expect(probability(0)).toBeFalsy()
})
test('probability 1 true',()=>{
    expect(probability(1)).toBeTruthy()
})

describe('randomness constraint to Math.random() === 0.5',()=>{
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });
    
    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    })

    test('probability 0.6 true, 0.4 false',()=>{
        expect(probability(0.6)).toBeTruthy()
        expect(probability(0.4)).toBeFalsy()
    })
})
describe('randomness constraint to Math.random() === 0.25',()=>{
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.25);
    });
    
    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    })

    test('probability 0.6 true, 0.4 true',()=>{
        expect(probability(0.6)).toBeTruthy()
        expect(probability(0.4)).toBeTruthy()
    })
})
describe('randomness constraint to Math.random() === 0.75',()=>{
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.75);
    });
    
    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    })

    test('probability 0.6 false, 0.4 false',()=>{
        expect(probability(0.6)).toBeFalsy()
        expect(probability(0.4)).toBeFalsy()
    })
})