import * as Tone from "tone";
import splKick from './sound/kick_soft.wav'
import splSnare from './sound/snare_noise.wav'
import splHat from './sound/hat8bit1.wav'

export function prepareSound (levelData,setInstruments,setCurrentPatterns,onGametick){
    Tone.start()
    Tone.Transport.bpm.value = levelData.music.bpm

    const piano = new Tone.Synth().toDestination();
    piano.oscillator.type = "triangle";
    piano.volume.value = -18

    const bass = new Tone.Synth().toDestination();
    bass.oscillator.type = "pwm";
    bass.volume.value = -24

    const spl = new Tone.Sampler({
        urls: {
        A1: splKick,
        B1: splSnare,
        C1: splHat,
        },
        onload: () => {
        console.log('samples loaded')
        }
    }).toDestination();
    spl.volume.value = -20

    setInstruments({
        piano, 
        sampler:spl, 
        bass
    })


    const when = '1:0:0'
    const tickId = Tone.Transport.scheduleRepeat((t)=>{
        Tone.Draw.schedule(()=>{
            onGametick()
        })
    }, levelData.gameTickInterval, when)

    const pat = new Tone.Pattern((t,n)=>{
        spl.triggerAttackRelease(n,'8n',t)
    },levelData.music.beat.data).start(when)
    pat.interval = levelData.music.beat.interval

    const patBass = new Tone.Pattern((t,n)=>{
        bass.triggerAttackRelease(
            Tone.Midi(n).toFrequency(),
            Tone.Time(levelData.music.bass.interval).toSeconds()/2,
            t
        )
    })
    patBass.interval = levelData.music.bass.interval
    patBass.pattern = 'up'

    setCurrentPatterns({tick: tickId, beat:pat, bass:patBass})

    Tone.Transport.start(0.2)
    Tone.Transport.position = '0:0:0'
    console.log(when)
    console.log(Tone.Transport.position)
    console.log(Tone.Transport.state)
    console.log(pat)
}

export function newBassLine (root, instrument, bassData, currentPatterns, setCurrentPatterns){
    const n = root[0]
    const nToInterval = {
      'C': 1,
      'D': 3,
      'E': 5,
      'F': 6,
      'G': 8,
      'A': 10,
      'B': 12,
    }
    const nn  = nToInterval[n]
    if(nn === undefined) return;
    const midiRoot = bassData.root;
    const newRoot = midiRoot + nn -1
    const newPattern = bassData.data.map(p=>newRoot + p - 1)

    const when = QuanTime(Tone.Transport.position,4,4)
    console.log(Tone.Transport.position, when)
    Tone.Transport.scheduleOnce((tt)=>{
        console.log(tt)
        currentPatterns.bass.values = newPattern
    }, Tone.Time(when).toSeconds() - 0.05)
    if(currentPatterns.bass.state === 'stopped') currentPatterns.bass.start(when)
  }

export function endSound(currentPatterns,setCurrentPatterns){
    currentPatterns.bass && currentPatterns.bass.dispose()
    currentPatterns.beat && currentPatterns.beat.dispose()
    Tone.Transport.cancel()
    setCurrentPatterns(null)
}

export function QuanTime(nowTime, atBeats, barBeats){
    const units = nowTime.split(':')
    const nowBar = parseInt(units[0])
    const nowBeat = parseInt(units[1])
  
    const quantize = (v,q)=>Math.floor((v + q)/q)*q;
  
    if(atBeats < barBeats){
      const adv =  quantize(nowBeat,atBeats)
      const nextBeat = adv%barBeats
      const nextBar = nowBar + Math.floor(adv/barBeats)
      return `${nextBar}:${nextBeat}:0`
    }
  
    const adv = atBeats/barBeats
    return `${quantize(nowBar,adv)}:0:0`
  }