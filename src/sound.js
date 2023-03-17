import * as Tone from "tone";
import splKick from './sound/kick8bit.wav'
import splSnare from './sound/snare8bit.wav'
import splHat from './sound/hat8bit2.wav'

export function prepareSound (levelData,setInstruments,onGametick){
    Tone.start()
    Tone.Transport.bpm.value = levelData.music.bpm
    Tone.Transport.start(0.2)

    const piano = new Tone.Synth().toDestination();
    piano.oscillator.type = "triangle";
    piano.volume.value = -18

    const bass = new Tone.Synth().toDestination();
    bass.oscillator.type = "pwm";
    bass.volume.value = -20

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

    setInstruments({
        piano, 
        sampler:spl, 
        bass
    })

    const when = Tone.Transport.nextSubdivision("1m");

    const pat = new Tone.Pattern((t,n)=>{
        spl.triggerAttackRelease(n,'8n',t)
    },levelData.music.beat.data)
    pat.interval = levelData.music.beat.interval
    Tone.Transport.scheduleRepeat((t)=>{
        Tone.Draw.schedule(()=>{
            onGametick()
        })
    }, levelData.gameTickInterval, when)
    pat.start(when)
    
}

export function newBassLine (root, instrument, bassData, currentBassLine, setCurrentBassLine){
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
    console.log(newRoot)

    if(currentBassLine) currentBassLine.dispose()
    const p = new Tone.Pattern((t,n)=>{
        instrument.triggerAttackRelease(
            Tone.Midi(newRoot + n - 1).toFrequency(),
            Tone.Time(bassData.interval).toSeconds()/2,
            t
        )
    }, bassData.data).start('@1m')
    p.interval = bassData.interval
    setCurrentBassLine(p)
  }