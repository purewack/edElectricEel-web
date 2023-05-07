import { generateClef, generateNewGuessPitch2, generateNoteWithAvoid } from "../Helpers/NoteGuess"

test('newNote random selection - single avoid',()=>{
    const notePool = ['C4','D4','E4','F4','G4','A4','B4','C#4','D#4','F#4','G#4','A#4']

    notePool.forEach(n => {
        expect(generateNoteWithAvoid(notePool,[n])).not.toEqual(n)
        expect(generateNoteWithAvoid(notePool,[n])).not.toEqual(n)
        expect(generateNoteWithAvoid(notePool,[n])).not.toEqual(n)
    })
})

test('newNote random selection - multiple avoid',()=>{
    const notePool = ['C4','D4','E4','F4','G4','A4','B4','C#4','D#4','F#4','G#4','A#4']
    expect(generateNoteWithAvoid(notePool,['C4','D4'])).not.toEqual(['C4','D4'])
})

test('newNote random selection - multiple avoid ... single note available',()=>{
    expect(generateNoteWithAvoid(['C4','D4','E4'],['C4','E4'])).toBe('D4')
    expect(generateNoteWithAvoid(['C4','D4','E4'],['D4','E4'])).toBe('C4')
    expect(generateNoteWithAvoid(['C4','D4','E4'],['C4','D4'])).toBe('E4')
})


describe('randomness constraint to Math.random() === 0.5',()=>{
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });
    
    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    })

    test('newNote middle selection',()=>{
        expect(generateNoteWithAvoid(['C4','D4','E4'],['C4'])).toBe('D4')
        expect(generateNoteWithAvoid(['C4','D4','E4'],['E4'])).toBe('D4')
    })

    test('clef generation with probability treble:70% bass:30%', ()=>{
        expect(generateClef({treble: 0.7, alto:0, bass:0.3})).toBe('treble')
    })
    test('clef generation with probability treble:20% bass:80%', ()=>{
        expect(generateClef({treble: 0.2, alto:0, bass:0.8})).toBe('bass')
    })
    test('clef generation with probability treble:49% bass:51%', ()=>{
        expect(generateClef({treble: 0.49, alto:0, bass:0.51})).toBe('bass')
    })
    test('clef generation with probability treble:51% bass:49%', ()=>{
        expect(generateClef({treble: 0.51, alto:0, bass:0.49})).toBe('treble')
    })
    test('treble presedence treble:50% bass:50%', ()=>{
        expect(generateClef({treble: 0.51, alto:0, bass:0.49})).toBe('treble')
    })
    test('treble presedence treble:33% bass:33% alto:33%', ()=>{
        expect(generateClef({treble: 0.33, alto:0.33, bass:0.33})).toBe('alto')
    })
})

describe('generateNewGuessPitch2 true random', () => { 
    test('treble 100%, #, avoid C4, 100x',()=>{
        for(let i=0; i<100; i++){
            const result = generateNewGuessPitch2('C4',{
                notes:['C4','D4','E4','F4'], 
                clefs:{treble:1}
            })
            expect(result.clef).toEqual('treble')
            expect(result.notes[0]).not.toEqual('C4')
            expect(result.notes[1]).not.toEqual('C4')
            expect(result.notes[0]).not.toEqual(result.notes[1])
        }
    })

    test('bass 100%, #, avoid C4, 100x',()=>{
        for(let i=0; i<100; i++){
            const result = generateNewGuessPitch2('C4',{
                notes:['C4','D4','E4','F4'], 
                clefs:{bass:1}
            })
            expect(result.clef).toEqual('bass')
            expect(result.notes[0]).not.toEqual('C4')
            expect(result.notes[1]).not.toEqual('C4')
            expect(result.notes[0]).not.toEqual(result.notes[1])
        }
    })

    test('alto 100%, #, avoid C4, 100x',()=>{
        for(let i=0; i<100; i++){
            const result = generateNewGuessPitch2('C4',{
                notes:['C4','D4','E4','F4'], 
                clefs:{alto:1}
            })
            expect(result.clef).toEqual('alto')
            expect(result.notes[0]).not.toEqual('C4')
            expect(result.notes[1]).not.toEqual('C4')
            expect(result.notes[0]).not.toEqual(result.notes[1])
        }
    })

    test('treble 50%, bass 50%, 100x',()=>{
        for(let i=0; i<100; i++){
            const result = generateNewGuessPitch2('C4',{
                notes:['C4','D4','E4','F4'], 
                clefs:{treble:0.5, bass:0.5}
            })
            expect(result.clef === 'treble' || result.clef === 'bass').toBeTruthy()
        }
    })

    test('treble 33% bass 33% alto 33%, 100x',()=>{
        for(let i=0; i<100; i++){
            const result = generateNewGuessPitch2('E4',{
                notes:['C4','D4','E4','F4'], 
                clefs:{treble:0.33, bass:0.33, alto:0.33}
            })
            expect(result.notes[0]).not.toBe('E4')
            expect(result.notes[1]).not.toBe('E4')
            expect(result.clef === 'treble' || result.clef === 'bass' || result.clef === 'alto').toBeTruthy()
            // console.log(result.clef)
        }
    })

    test('prefer flats only 10x',()=>{
        for(let i=0; i<10; i++){
            const result = generateNewGuessPitch2('D#4',{
                notes:['C#4','D#4','F#4'], 
                clefs:{treble:0.5, bass:0.5},
                accidentalPreference: 'flat'
            })
            expect(result.notes[0]).not.toEqual('Eb4')
            expect(result.notes[1]).not.toEqual('Eb4')
            expect(result.notes[0]).toContain('b')
            expect(result.notes[1]).toContain('b')
        }
    })
})