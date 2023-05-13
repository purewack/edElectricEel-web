import * as Generators from '../Helpers/Generators'

describe('mocked generateClef', ()=>{

    test('mock value getClefFromProbability() === \'mockvalue\'',()=>{
        jest.spyOn(Generators, 'getClefFromProbability').mockReturnValue('mockvalue')
        expect(Generators.getClefFromProbability({treble:0.02, alto: 0.18, bass:0.80})).toBe('mockvalue')
        jest.spyOn(Generators, 'getClefFromProbability').mockRestore();
    })

    test('mock value getClefFromProbability() === \'treble\'',()=>{
        jest.spyOn(Generators, 'getClefFromProbability').mockReturnValue('treble')
        expect(Generators.getClefFromProbability({treble:0.02, alto: 0.18, bass:0.80})).toBe('treble')
        jest.spyOn(Generators, 'getClefFromProbability').mockRestore();
    })
})

describe('pick notes', ()=>{
    test('[C4, D4, E4, F4] pick 3 notes, ',()=>{
        const avoid = 'C4'
        const pool = ['C4','D4','E4','F4']
        const result1 = Generators.pickNoteFromPoolAvoid(pool,[avoid])
        const result2 = Generators.pickNoteFromPoolAvoid(pool,[avoid,result1])
        const result3 = Generators.pickNoteFromPoolAvoid(pool,[avoid,result1,result2])

        expect(result1).not.toBe(avoid)

        expect(result2).not.toBe(avoid)
        expect(result2).not.toBe(result1)

        expect(result3).not.toBe(avoid)
        expect(result3).not.toBe(result1)
        expect(result3).not.toBe(result2)
    })

    test('[C4, D4, E4, F4] avoid all but E4, ',()=>{
        const pool = ['C4','D4','E4','F4']
        const avoid = ['C4','D4','F4']
        expect(Generators.pickNoteFromPoolAvoid(pool,avoid)).toBe('E4')
    })
})