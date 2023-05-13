import {   
    getNote, 
    getMidi, 
    toMidiArray, 
    respellPitch, 
    respellPitches, 
    limit
} from "../Helpers/Hooks"

import {
    makeSelectionFromRangeMidi,
    makeSelectionFromRangeNotes,
    enumerateRangePerClef,
} from '../Helpers/Generators'

const rangeEasy = ['C4','D4','E4']
const rangeMed = ['C4','D4','E4','F4','G4','A4','B4']
const rangeHard = ['C4','D4','E4','F4','G4','A4','B4','C#4','D#4','F#4','G#4','A#4']

export const rangeInit = {
    range:rangeEasy, //pool of notes
    rangeChromatic: false, //flag if range has accidentals
    rangeHint:false, 

    adjustingRange: false, //touch event flags 
    adjustingClef: false, 
    hoverClef: false,
    hoverRange: false,
    fine:false, 

    start: getMidi('C4'), //internal range limits calc 
    end: getMidi('E4'), 
    _low: getMidi('C4'),
    _high: getMidi('E4'),
    noteLow: 'C4',
    noteHigh: 'E4',

    accidentals: { //accidentail use hints
        use: false,
        prefer: 'sharp'
    },

    clefs:{ //clef probabilities
        treble:1,
        alto:0,
        bass:0
    },
    rangeClefs: { //number of notes per clef in pool
        treble: 3,
        alto: 0,
        bass: 0
    },
    clefLock: { //if range is chance adjust locked or not
        treble: false,
        alto: true,
        bass: true
    },
    clefLimit :{
        treble: [0,1],
        alto:   [0,1],
        bass:   [0,1],
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
        const chancesBass = {treble: 0, bass:1, alto: 0}
        const chancesTreble = {treble: 1, bass:0, alto: 0}
        const chancesEqual = {treble: 0.5, bass:0.5, alto:0}
      
        const en = enumerateRangePerClef(range)
        let rl = {treble:false, alto:false, bass:false}
        rl.alto = (en.alto === 0)
        rl.treble = (en.treble === 0)
        rl.bass = (en.bass === 0)
        rl.treble |= (!en.bass && !en.alto)
        rl.bass |= (!en.bass && !en.alto)
        r.clefLock = {...rl}
        r.rangeClefs = {...en}

        // if(ml < bassTresh && mh < bassTresh) r.clefs = {...r.clefs, ...chancesBass}
        // else if(ml >= bassTresh && mh >= bassTresh) r.clefs = {...r.clefs, ...chancesTreble}
        if(rl.treble && !rl.bass) r.clefs = {...r.clefs, ...chancesBass}
        else if(rl.bass && !rl.treble) r.clefs = {...r.clefs, ...chancesTreble}
        else if(!rl.treble && !rl.alto && !rl.bass) r.clefs = {...r.clefs, ...chancesEqual}
        
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
            if(r.range.length === 3) {
                if((dy > 0 && action.type === 'changeRangeMin') 
                || (dy < 0 && action.type === 'changeRangeMax'))
                    return r
            }

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
                if(r.range.length === 3) return r
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
            if(r.rangeClefs[action.clef] === 0) return r
            r.adjustingClef = true
            return r
    
        case 'stopClefChance':
            r.adjustingClef = false
            return r

        case 'adjustClefChance':{
            if(!r.adjustingClef) return r
            const c = action.clef
            const m = (action.movement/200)
            const rl = r.clefLock
            const cc = r.clefs
            const en = r.rangeClefs
         
            const balanceTrebleAlto = (pure) => {
                // if(c === 'bass' && !pure && m > 0) {
                //     r.clefs.bass = 0.01
                //     return
                // } 
                if(c === 'bass' && m < 0 && !r.clefs.bass)
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

            }
            const balanceBassAlto = (pure) => {
                // if(c === 'treble' && !pure && m > 0) {
                //     r.clefs.treble = 0.01
                //     return
                // } 
                if(c === 'treble' && m < 0 && !r.clefs.treble)
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

            }
            const balanceTrebleBass = () => {
                // if(c === 'alto' && m > 0) {
                //     r.clefs.alto = 0.01
                //     return
                // } 
                if(c === 'alto' && m < 0 && !r.clefs.alto)
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
                
            }
            const balanceAll = () => {
                if(m < 0){
                    if((isAtLimit(c)))
                        return
                }

                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.bass -= m/2
                    r.clefs.alto -= m/2
                }
                else if(c === 'bass')
                {
                    r.clefs.treble -= m/2
                    r.clefs.bass += m
                    r.clefs.alto -= m/2
                }
                else if(c === 'alto'){
                    r.clefs.treble -= m/2
                    r.clefs.bass -= m/2
                    r.clefs.alto += m
                }                

            }

            if(rl[c]) return r

            const lim = r.clefLimit
            const isAtLimit = (name) => (cc[name] === lim[name][0] || cc[name] === lim[name][1]) 

            r.bal = null
            r.bal2 = null

            if(!rl.treble && !rl.bass && !rl.alto){
                if(en.treble < 3 && en.alto < 3 && en.bass < 3){
                    r.bal2 = 'lim all under'
                    r.clefLimit = {
                        treble: [0.01, 0.99],
                        alto:   [0.00, 0.98],
                        bass:   [0.01, 0.99]
                    }
                }
                else if(en.treble >= 3 && en.alto >= 3 && en.bass >= 3){
                    r.bal2 = 'lim all over'
                    r.clefLimit = {
                        treble: [0.00, 1.0],
                        alto:   [0.00, 1.0],
                        bass:   [0.00, 1.0]
                    }
                }
                else if(en.treble >= 3 && en.alto < 3 && en.bass >= 3){
                    r.bal2 = 'lim under alto'
                    r.clefLimit = {
                        treble: [0.00, 1.0],
                        alto:   [0.00, 0.99],
                        bass:   [0.00, 1.0]
                    }
                }
                else if(en.treble < 3 && en.alto >= 3 && en.bass >= 3){
                    r.bal2 = 'lim under treb'
                    r.clefLimit = {
                        treble: [0.00, 0.99],
                        alto:   [0.00, 1.0],
                        bass:   [0.00, 1.0]
                    }
                }
                else if(en.treble >= 3 && en.alto >= 3 && en.bass < 3){
                    r.bal2 = 'lim under bass'
                    r.clefLimit = {
                        treble: [0.00, 1.0],
                        alto:   [0.00, 1.0],
                        bass:   [0.00, 0.99]
                    }
                }
                else { 
                    r.clefLimit = {
                    //     treble: en.treble < 3 ? [0.00, 0.99] : (en.bass  +en.alto >=3 ? [0.00, 1.00] : [0.01, 1.00]),
                    //     alto:   en.alto   < 3 ? [0.00, 0.99] : (en.treble+en.bass >=3 ? [0.00, 1.00] : [0.01, 1.00]),
                    //     bass:   en.bass   < 3 ? [0.00, 0.99] : (en.treble+en.alto >=3 ? [0.00, 1.00] : [0.01, 1.00])
                    // }
                        treble: en.treble < 3 ? [0.00, 0.99] : [0.01, 1.00],
                        alto:   en.alto   < 3 ? [0.00, 0.99] : [0.01, 1.00],
                        bass:   en.bass   < 3 ? [0.00, 0.99] : [0.01, 1.00]
                    }
                    r.bal2 = 'lim else: '
                }

                if(c !== 'treble' && isAtLimit('treble')){
                    balanceBassAlto()
                    r.bal = 'all - bass alto'
                }
                else if(c !== 'bass' && isAtLimit('bass')){
                    balanceTrebleAlto()
                    r.bal = 'all - treb alto'
                }
                else if(c !== 'alto' && isAtLimit('alto')){
                    r.bal = 'all - treb bass'
                    balanceTrebleBass()
                }
                else{
                    balanceAll()
                    r.bal = 'all - all'
                }

                
            }
            else if(rl.bass){
                balanceTrebleAlto()
                r.bal = 'treb alto'
                if(en.treble < 3 && en.alto < 3) {
                    r.clefLimit = {
                        treble: [0.01, 0.99],
                        alto:   [0.01, 0.99],
                        bass:   [0.00, 1.00]
                    }
                }
                else if(en.treble < 3 && en.alto >= 3) {
                    r.clefLimit = {
                        treble: [0.00, 0.99],
                        alto:   [0.01, 1.00],
                        bass:   [0.00, 1.00]
                    }
                }
                else if(en.treble >= 3 && en.alto < 3) {
                    r.clefLimit = {
                        treble: [0.01, 1.00],
                        alto:   [0.00, 0.99],
                        bass:   [0.00, 1.00]
                    }
                } 
                else{
                    r.clefLimit = {
                        treble: [0.00, 1.00],
                        alto:   [0.00, 1.00],
                        bass:   [0.00, 1.00]
                    }
                }
            }
            else if(rl.treble){
                balanceBassAlto()
                r.bal = 'bass alto'
                if(en.bass < 3 && en.alto < 3) {
                    r.clefLimit = {
                        treble: [0.00, 1.00],
                        alto:   [0.01, 0.99],
                        bass:   [0.01, 0.99]
                    }
                }
                else if(en.bass < 3 && en.alto >= 3) {
                    r.clefLimit = {
                        treble: [0.00, 1.00],
                        alto:   [0.01, 1.00],
                        bass:   [0.00, 0.99]
                    }
                }
                else if(en.bass >= 3 && en.alto < 3) {
                    r.clefLimit = {
                        treble: [0.00, 1.00],
                        alto:   [0.00, 0.99],
                        bass:   [0.01, 1.00]
                    }
                }
                else{
                    r.clefLimit = {
                        treble: [0.00, 1.00],
                        alto:   [0.00, 1.00],
                        bass:   [0.00, 1.00]
                    }
                }
            }
            else if(rl.alto){
                balanceTrebleBass()
                if(en.bass < 3 && en.treble < 3) {
                    r.clefLimit = {
                        treble: [0.01, 0.99],
                        alto:   [0.00, 1.00],
                        bass:   [0.01, 0.99]
                    }
                }
                else if(en.bass < 3 && en.treble >= 3) {
                    r.clefLimit = {
                        treble: [0.01, 1.00],
                        alto:   [0.00, 1.00],
                        bass:   [0.00, 0.99]
                    }
                }
                else if(en.bass >= 3 && en.treble < 3) {
                    r.clefLimit = {
                        treble: [0.00, 0.99],
                        alto:   [0.00, 1.00],
                        bass:   [0.01, 1.00]
                    }
                }
                else{
                    r.clefLimit = {
                        treble: [0.00, 1.00],
                        alto:   [0.00, 1.00],
                        bass:   [0.00, 1.00]
                    }
                }
            }

            r.clefs.bass   = limit(r.clefs.bass,  r.clefLimit.bass[0],  r.clefLimit.bass[1])
            r.clefs.alto   = limit(r.clefs.alto,  r.clefLimit.alto[0],  r.clefLimit.alto[1])
            r.clefs.treble = limit(r.clefs.treble,r.clefLimit.treble[0],r.clefLimit.treble[1])

            r.bal3 = JSON.stringify(r.clefLimit)
            return r
        }

        case 'balanceClefChance':{
            const c = action.clef
            const cc = r.clefs
            const rl = r.clefLock
            const en = r.rangeClefs

            if(rl.bass && rl.treble && rl.alto){
                if(en.treble) r.clefs = {treble:1, alto:0,bass:0}
                else if(en.bass) r.clefs = {bass:1, alto:0,treble:0}
                return r
            }
        
            if(!rl.bass && rl.alto && !rl.treble)
                r.clefs = {treble: 0.5, alto:0, bass:0.5}
            else if(!rl.bass && !rl.alto && rl.treble)
                r.clefs = {treble: 0, alto:0.5, bass:0.5}
            else if(rl.bass && !rl.alto && !rl.treble)
                r.clefs = {treble: 0.5, alto:0.5, bass:0}

            else if(!rl.bass && !rl.alto && !rl.treble)
                r.clefs = {treble: 0.33, alto:0.33, bass:0.33}

            return r
        }

        case 'random':{
            r.clefs = {
                treble: 1.0,
                alto: 0.0,
                bass: 0.0
            }
            
            r.accidentals = {use: true, prefer: 'both'}

            r.range = makeSelectionFromRangeNotes('C4','B4',true)
            r.rangeChromatic = undefined
            r.range = r.range.map(n => {
                if(Math.random() > 0.5) return n
                return null
            })
            r.range = r.range.filter(e => e!==null)
            if(r.range.length < 3 ) r.range = [...rangeEasy]
            recalcRange(r.range)
            return r
        }

        case 'none': {
            r.previewNoteViewData = []
            r.range = []
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
