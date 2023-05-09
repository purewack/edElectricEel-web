import {   
    getNote, 
    getMidi, 
    toMidiArray, 
    respellPitch, 
    respellPitches, 
    makeSelectionFromRangeNotes,
    makeSelectionFromRangeMidi,
    noAccidentals, 
    limit, 
    rand,
    enumerateRangePerClef,
    enumerateRangePerClefExtended,
    isWithinLimits
} from "../Helpers/Hooks"

const rangeEasy = ['C4','D4','E4']
const rangeMed = ['C4','D4','E4','F4','G4','A4','B4']
const rangeHard = ['C4','D4','E4','F4','G4','A4','B4','C#4','D#4','F#4','G#4','A#4']

export const rangeInit = {
    range:rangeEasy,
    rangeChromatic: false,
    rangeHint:false,

    adjustingRange: false, 
    adjustingClef: false, 
    hoverClef: false,
    hoverRange: false,
    fine:false, 

    start: getMidi('C4'), 
    end: getMidi('E4'), 
    _low: getMidi('C4'),
    _high: getMidi('E4'),
    noteLow: 'C4',
    noteHigh: 'E4',

    accidentals: {
        use: false,
        prefer: 'sharp'
    },

    clefs:{
        treble:1,
        alto:0,
        bass:0
    },
    rangeClefs: {
        treble: 3,
        alto: 0,
        bass: 0
    },
    clefLock: {
        treble: false,
        alto: true,
        bass: true
    }
}
export const rangeReducer = (state, action)=>{
    let r = {...state}

    const bassTresh = getMidi('C4')
    const recalcRange = (range)=>{
        const newRangeMidi = toMidiArray(range)
        r.start = Math.min(...newRangeMidi)
        r.end = Math.max(...newRangeMidi)
        r.noteLow = getNote(r.start, r.accidentals.prefer === 'flat' ? 'flat' : undefined)
        r.noteHigh = getNote(r.end, r.accidentals.prefer === 'flat' ? 'flat' : undefined)
        const mh = getMidi(r.noteHigh)
        const ml = getMidi(r.noteLow)
        const chancesBass = {treble: 0, bass:1, alto: 0}
        const chancesTreble = {treble: 1, bass:0, alto: 0}
        const chancesEqual = {treble: 0.5, bass:0.5, alto:0}
      
        r.rangeClefs = enumerateRangePerClefExtended(range)
        const rc = r.rangeClefs
        const rl = r.clefLock
        rl.alto = (rc.alto < 3)
        rl.treble = (rc.treble < 3 || rl.alto)
        rl.bass = (rc.bass < 3 || rl.alto)

        if(ml < bassTresh && mh < bassTresh) r.clefs = {...r.clefs, ...chancesBass}
        else if(ml >= bassTresh && mh >= bassTresh) r.clefs = {...r.clefs, ...chancesTreble}
        else r.clefs = {...r.clefs, ...chancesEqual}
        r.clefLock = rl

        const bassNotes = range.filter(n => getMidi(n)<bassTresh)
        const trebNotes = range.filter(n => getMidi(n)>=bassTresh)
        let data = []
        if(bassNotes.length)
            data.push({clef:'bass', notes: [...bassNotes]})
        if(trebNotes)
            data.push({clef:'treble', notes: [...trebNotes]})
        r.previewNoteViewData = data
    }


    switch(action.type){
        case 'set':
            r.range = [...action.data.notes]
            r.clefs = {...action.data.clefs}
            r.accidentals = {
                use: action.data.accidentalPreference !== undefined,
                prefer: action.data.accidentalPreference
            }
            recalcRange(r.range)
            return r
        
        case 'startRangeAdjust': 
            r.adjustingRange = true 
            return r
        case 'stopRangeAdjust':
            r.adjustingRange = false
            return r
        case 'startFine':
            r.fine = true
            return r
        case 'endFine':
            r.fine = false
            return r
    
        case 'changeRangeMax':
        case 'changeRangeMin':{
            const dy = limit(action.movement,-1,1)
            if(r.range.length === 3 && dy < 0 && action.type === 'changeRangeMax') return r
            if(r.range.length === 3 && dy > 0 && action.type === 'changeRangeMin') return r

            if(action.type === 'changeRangeMin')
                r._low =  limit(r._low+dy,  getMidi('C2'), r._high-3)
            else
                r._high = limit(r._high+dy, r._low+3, getMidi('B6'))

            r.range = makeSelectionFromRangeMidi(r._low,r._high,state.accidentals.use)
            r.rangeChromatic = state.accidentals.use
            recalcRange(r.range)
            return r
        }
        case 'keypress':{
            const n = action.key
            
            if(r.range.includes(n)) {
                if(r.range.length <= 4) return r
                r.range= r.range.filter(e => respellPitch(e,'sharp') !== n)
                r.rangeChromatic = undefined
                recalcRange(r.range)
                return r
            }
            else {
                let newRange = [...r.range]
                newRange.push(n)
                recalcRange(newRange)
                r.range = newRange
                r.rangeChromatic = undefined
                return r
            }
        }

        case 'noAccidentals':{
            let newRange = makeSelectionFromRangeMidi(r.start,r.end,false)
            if(newRange.length < 3){
                if(newRange.at(-1) === 'B6') {
                    newRange = makeSelectionFromRangeMidi(r.start-1,r.end,false)
                }
                else {
                    newRange = makeSelectionFromRangeMidi(r.start,r.end+1,false)
                }
            }
            recalcRange(newRange)
            return {...r, range: newRange, rangeChromatic:false, accidentals: {...r.accidentals, use:false}}
        }
        case 'useAccidentals':{
            const newRange = makeSelectionFromRangeMidi(r.start,r.end,true)
            recalcRange(newRange)
            return {...r, range: newRange, rangeChromatic: true, accidentals: {...r.accidentals, use:true}}
        }
        case 'nextAccidentalPref': 
            let next
            if(r.accidentals.prefer === 'both') next = 'sharp'
            else if(r.accidentals.prefer === 'sharp') next = 'flat'
            else if(r.accidentals.prefer === 'flat') next = 'both'
            r.accidentals.prefer = next
            
            const rrange = respellPitches(r.range, (next === 'flat' ? 'flat' : 'sharp'))
            r.range = rrange

            recalcRange(r.range)
            return r

        
        case 'startClefChance':
            if(r.rangeClefs[action.clef] < 3) return r
            if(action.clef === 'treble' && !r.rangeClefs.alto && !r.rangeClefs.bass) return r
            if(action.clef === 'bass' && !r.rangeClefs.alto && !r.rangeClefs.treble) return r
            r.adjustingClef = true
            return r
    
        case 'stopClefChance':
            r.adjustingClef = false
            return r

        case 'adjustClefChance':{
            if(!r.adjustingClef) return r
            const c = action.clef
            const m = (action.movement/200)
         
            const balanceTrebleAlto = (pure) => {
                if(c === 'bass' && !pure && m > 0) {
                    r.clefs.bass = 0.01
                    return
                } 
                else if(c === 'bass' && m < 0 && !r.clefs.bass)
                    return
                else
                    r.clefs.bass = 0

                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.alto = 1-r.clefs.treble
                }
                else{
                    r.clefs.alto += m
                    r.clefs.treble = 1-r.clefs.alto
                }
                r.clefs.treble = limit(r.clefs.treble,0,1)
                r.clefs.alto = limit(r.clefs.alto,0,1)
            }
            const balanceBassAlto = (pure) => {
                if(c === 'treble' && !pure && m > 0) {
                    r.clefs.treble = 0.01
                    return
                } 
                else if(c === 'treble' && m < 0 && !r.clefs.treble)
                    return
                else
                    r.clefs.treble = 0

                if(c === 'bass'){
                    r.clefs.bass += m
                    r.clefs.alto = 1-r.clefs.bass
                }
                else{
                    r.clefs.alto += m
                    r.clefs.bass = 1-r.clefs.alto
                }
                r.clefs.bass = limit(r.clefs.bass,0,1)
                r.clefs.alto = limit(r.clefs.alto,0,1)
            }
            const balanceTrebleBass = () => {
                if(c === 'alto' && m > 0) {
                    r.clefs.alto = 0.01
                    return
                } 
                else if(c === 'alto' && m < 0 && !r.clefs.alto)
                    return
                else
                    r.clefs.alto = 0

                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.bass = 1-r.clefs.treble
                }
                else{
                    r.clefs.bass += m
                    r.clefs.treble = 1-r.clefs.bass
                }
                r.clefs.treble = limit(r.clefs.treble,0,1)
                r.clefs.bass = limit(r.clefs.bass,0,1)
            }
            const balanceAll = () => {
                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.bass -= m/2
                    r.clefs.alto -= m/2
                }
                else if(c === 'bass'){
                    r.clefs.treble -= m/2
                    r.clefs.bass += m
                    r.clefs.alto -= m/2
                }
                else if(c === 'alto'){
                    r.clefs.treble -= m/2
                    r.clefs.bass -= m/2
                    r.clefs.alto += m
                    if(r.clefs.alto >= 0.99){
                        r.clefs = {
                            bass:0,
                            treble:0,
                            alto:1
                        }
                    }
                }
                r.clefs.treble = limit(r.clefs.treble,0,1)
                r.clefs.alto = limit(r.clefs.alto,0,1)
                r.clefs.bass = limit(r.clefs.bass,0,1)
            }

            const cr = enumerateRangePerClefExtended(r.range)
            const cc = r.clefs
            console.log(JSON.stringify({cr,cc}))
            if(cr.treble >= 3 && cr.bass >= 3 && cr.alto >= 3){
                if(!cc.alto)
                    balanceTrebleBass()
                else if(!cc.treble)
                    balanceBassAlto()
                else if(!cc.bass)
                    balanceTrebleAlto()
                else
                    balanceAll()
            }
            else if(cr.treble >= 3 && cr.alto >= 3 && cr.bass < 3)
                balanceTrebleAlto()
            else if(cr.bass >= 3 && cr.alto >= 3 && cr.treble < 3)
                balanceBassAlto()
            else if(cr.bass >= 3 && cr.treble >= 3 && cr.alto < 3)
                balanceTrebleBass()

            return r
        }

        case 'random':{
            r.clefs = {
                treble: 1.0,
                alto: 0.0,
                bass: 0.0
            }
            
            r.accidentals = {use: true, prefer: 'both'}

            r.range = makeSelectionFromRangeMidi(getMidi('C4'),getMidi('B4'))
            r.rangeChromatic = undefined
            r.range = r.range.map(n => {
                if(Math.random() > 0.5) return n
                return null
            })
            r.range = r.range.filter(e => e!==null)
            if(r.length < 3 ) r.range = [...rangeEasy]
            recalcRange(r.range)
            return r
        }

        case 'preset':
            r.clefs = {treble:1, bass:0, alto:0}
            r.rangeChromatic = false
            r.accidentals = {use:false,prefer:'sharp'}
            if(action.difficulty === 'hard'){
                r.range = [...rangeHard]
                r.rangeChromatic = true
                r.accidentals = {use:true, prefer:'sharp'}
            }
            else if(action.difficulty === 'medium')
                r.range = [...rangeMed]
            else 
                r.range = [...rangeEasy]
            
            recalcRange(r.range)
            return r

        default:
            return r
    }
}
