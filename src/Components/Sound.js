import * as Tone from "tone";
import { Midi } from '@tonejs/midi'
import midiPresets from './midiset.json'

// Tone.setContext(new Tone.Context({ latencyHint : "balanced", lookAhead: 0.5 }))

let soundPrepared = false;
export class MidiFilePlayer {
    #transpose = 0;

    constructor(){
        this.players = {
            piano:  new Tone.PolySynth(),
            lead:  new Tone.DuoSynth(),
            lead2:  new Tone.DuoSynth(),
            melody: new Tone.PolySynth(),
            bass:   new Tone.Synth(),
            drums:  new Tone.Sampler(),

            quality: new Tone.BitCrusher(8),
            filter: new Tone.Filter(8000,undefined,-24),

            input: new Tone.Synth().toDestination(),
        }
        this.output = new Tone.Volume(-3).toDestination()
        const q = this.players.quality
        const f = this.players.filter
        const o = this.output
        o.toDestination()
        f.connect(o)  
        q.connect(f)
        q.set({wet:1});
        this.players.piano.connect(q)
        this.players.lead.connect(q)
        this.players.lead2.connect(q)
        this.players.melody.connect(q)
        this.players.bass.connect(q)
        this.players.drums.connect(q)

        this.players.bass.set(midiPresets.bass)
        this.players.melody.set(midiPresets.melody)
        this.players.lead.set(midiPresets.lead)
        this.players.lead2.set(midiPresets.lead2)
        this.players.piano.set(midiPresets.piano)
        
        this.loadSampler()
        this.song = null
        console.log('new MidiFilePlayer');
    }
    destroy(){
        Tone.Transport.stop();
        Tone.Transport.clear();
        Tone.Transport.cancel();
        this.song = null;
        this.players.drums.dispose();
        this.players.input.dispose();
        this.players.bass.dispose();
        this.players.melody.dispose();
        this.players.lead.dispose();
        this.players.lead2.dispose();
        this.players = null;
    }
    loadSampler(onProgress){
        return new Promise((resolve)=>{
            const keys = Object.keys(midiPresets.drums.samples);
            let loaded = 0;
            const check = ()=>{
                loaded++
                onProgress(keys[loaded],[loaded,keys.length])
                if(loaded === keys.length) resolve(loaded)    
            }
            keys.forEach(k => {
                console.log('loading MIDI drum sample: ',midiPresets.drums.samples[k].sample)
                this.players.drums.add(k,'Sounds/' + midiPresets.drums.samples[k].sample,check)
            })
        })
    }

    load(songList ,onProgress){ 
        this.songs = {}
        return new Promise((resolve, reject)=>{
            const count = songList.length
            let loaded = 0;
            let failed = 0; 
            const check = ()=>{
                if(failed === count) reject()
                if(loaded + failed === count) {
                    resolve(loaded,failed)
                }
            }
            songList.forEach((s,i,a)=>{
                Midi.fromUrl("Songs/" + s).then((json)=>{
                    this.songs[s] = json
                    loaded++
                    check()
                    onProgress(s,[i+1,a.length])
                }).catch(()=>{
                    failed++
                    check()
                })
            })
        })
    }

    // schedule + play immidiate
    play(song, onBar = null, offset = 0, append = false){
        if(!song) return;
        this.stop(this.song ? 1.5 : 0).then(()=>{
            
        this.prepare(song, (loaded)=>{
            console.log(loaded)
        },offset,append).then(()=>{
            this.begin(onBar)
        })
   
        });
    }

    //stop immidiate
    stop(inTime = 0){
        return new Promise((resolve)=>{
            const dt = inTime;
            this.output.volume.linearRampTo(-120,dt);
            Tone.Transport.stop(Tone.now() + dt);
            setTimeout(()=>{
                resolve()
            },(dt + 0.1) * 1000)
        })
    }

    //being playing previousely prepared midi
    begin(onBar){
        console.log('begin')
        
        this.unmute()

        this.output.volume.value = -3;
        if(onBar){
            Tone.Transport.scheduleRepeat(()=>{
                Tone.Draw(()=>{onBar()})
            },'1m','0:0:0');
        }
        Tone.Transport.start("+0.5","0:0:0");
    }

    //pre schedule events before playing
    prepare(song, onProgress, offset = 0, append = false){ 
        const midiJson = this.songs[song]
        console.log(song,this.songs)
        
        return new Promise((resolve, reject)=>{
            if(this.song === song) {
                resolve(midiJson)
                return
            }
            if(!append) Tone.Transport.clear();
            Tone.Transport.bpm.value = midiJson.header.tempos[0].bpm
            const off = Tone.TransportTime(offset).toSeconds();
            Tone.Transport.loopEnd = midiJson.duration + off;
            Tone.Transport.loopStart = off;
            Tone.Transport.loop = true;

            const count = midiJson.tracks.length
            let loaded = 0;
            let failed = 0; 
            const check = ()=>{
                if(failed === count) reject()
                if(loaded + failed === count) {
                    this.loaded = song
                    resolve(midiJson, loaded,failed)
                }
            }
    
            midiJson.tracks.forEach(t => {
                const drums = t.name.includes('drums')
                const vv = this.players[t.name]

                if(!vv || !t.notes.length) {
                    failed++
                    check();
                    return;
                }

                t.notes.forEach(n => {
                    if(drums){
                        Tone.Transport.schedule((tt)=>{
                            vv.triggerAttackRelease(n.name, '1n', tt, n.velocity);
                        },n.time + off)
                    }
                    else{
                        Tone.Transport.schedule((tt)=>{
                            const tr = this.#getTranspose() 
                            vv.triggerAttackRelease(Tone.Midi(n.midi + tr).toFrequency(), n.duration, tt, n.velocity);
                        },n.time + off)
                    }
                })
                loaded++
                if(onProgress) onProgress(t.name, [loaded, midiJson.tracks.length])
                check()
            })
        })
    }


    unmute(tracks, inTime = 0){
        const tr = tracks ? tracks : Object.keys(midiPresets)
        tr.forEach(k => {
            this.players[k].volume.linearRampTo(midiPresets[k].volume, inTime);
        })
    }
    mute(tracks, inTime = 0){
        const tr = tracks ? tracks : Object.keys(midiPresets)
        tr.forEach(k => {
            this.players[k].volume.linearRampTo(-120, inTime);
        })
    }

    #getTranspose(){
        return this.#transpose;
    }

    transpose(t){
        this.#transpose = t;
    }
}

export class BGMPlayer {
    constructor(){
        this.songs = new Tone.ToneAudioBuffers();
        this.players = [
            new Tone.Player().toDestination(), 
            new Tone.Player().toDestination()
        ];
        this.player = this.players[0];
        this.players[0].loop = true;
        this.players[1].loop = true;
        console.log('new BGMPlayer')
    }
    load(songlist, onProgress){
        this.songs.dispose();
        this.songs = new Tone.ToneAudioBuffers();
        return new Promise((resolve, reject)=>{
            const count = songlist.length;
            let loaded = 0;
            let failed = 0; 
            const check = ()=>{
                if(failed === count) 
                    reject()
                if(loaded + failed === count) 
                    resolve(loaded,failed)   
            }
            songlist.forEach(s => {
                this.songs.add(s,'Songs/' + s, 
                ()=>{
                    loaded++
                    if(onProgress) onProgress(s,[loaded, songlist.length])
                    check();
                },
                ()=>{
                    failed++;
                    check();
                });
            })
        })
    }

    destroy(){
        this.songs.dispose();
        this.players[0].dispose();
        this.players[1].dispose();
        this.players = null;
        this.player = null;
        this.songs = null;
    }

    #crossSwap(){
        if(this.player === this.players[0])
            this.player = this.players[1]
        else
            this.player = this.players[0]
    }

    play(name, crossfade = undefined){
        const go = (player)=>{
            this.player.volume.value = 0;
            player.buffer = this.songs.get(name);
            player.start();
        }
        if(!crossfade){
            this.stop().then(()=>{
                go(this.player);
            });
            return;
        }
        this.stop(true)
        this.#crossSwap()
        go(this.player)
        this.player.volume.value = -120;
        const dt = crossfade;
        this.player.volume.linearRampTo(0, dt);
        console.log('started @ ',Tone.now())
    }
    stop(inTime = 0.5){
        if(!inTime){
            this.player.stop(Tone.now());
            return;
        }
        const dt = inTime;
        const player = this.player
        console.log('stopping @ ',Tone.now())
        return new Promise((resolve)=>{
            if(player.state === 'stopped') {
                resolve();
                return;
            }
            player.volume.linearRampTo(-120,dt);
            player.stop(Tone.now() + dt);
            setTimeout(()=>{
                resolve()
            },(dt + 0.1)*1000)
        })
    }
}
export const songPlayer = new BGMPlayer();
export const midiPlayer = new MidiFilePlayer();

let gameTickId = null

export function startPitchGameSong (levelData,onGametick){
    if(gameTickId) endGameSong()

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = '0:0:0';
    midiPlayer.prepare('pitch_game.mid',null,'1:0:0',true).then(()=>{
        const countdown = new Tone.Pattern((t,n)=>{
            midiPlayer.players.drums.triggerAttackRelease(n,'8n',t)
        },['F#2','F#2','F#2','D#3']).start('0:0:0').stop('1:0:0')
        gameTickId = Tone.Transport.scheduleRepeat((t)=>{
            Tone.Draw.schedule(()=>{
                onGametick()
            },t)
        }, levelData.gameTickInterval, '1:0:0')
        midiPlayer.begin(null)
    })
}

export function endGameSong(){
    // soundPrepared = false
    // currentPatterns.bass && currentPatterns.bass.dispose()
    // currentPatterns.beat && currentPatterns.beat.dispose()
    // Tone.Transport.clear()
    // Tone.Transport.cancel()
    // setCurrentPatterns(null)
    Tone.Transport.clear(gameTickId)
    Tone.Transport.stop();
    midiPlayer.stop();
}

export function setGameSongPitch(root){
    const newRoot = Tone.Frequency(root).toMidi() % 12

    const when = QuanTime(Tone.Transport.position,1,4)
    console.log(Tone.Transport.position, when)
    Tone.Transport.scheduleOnce((tt)=>{
        midiPlayer.transpose(newRoot)
    }, Tone.Time(when).toSeconds() - 0.05)
}

export function playSoundEffect(name){
    // sampler.triggerAttackRelease(sound[0], sound[1]);
}

export function playGameInput(note){
    midiPlayer.players.input.triggerAttackRelease(note,'8n','@8n');
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