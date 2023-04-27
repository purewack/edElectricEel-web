import * as Tone from "tone";
import { Midi } from '@tonejs/midi'
import midiPresets from './midiset.json'
import effectsSet from './effectset.json'

// Tone.setContext(new Tone.Context({ latencyHint : "playback", lookAhead: 0.5 }))

export class MidiFilePlayer {
    #transpose = 0;
    #onbar;
    #onbeat;

    constructor(autoload = true){
        this.players = {
            piano:  new Tone.PolySynth(),
            lead:  new Tone.DuoSynth(),
            lead2:  new Tone.DuoSynth(),
            harmo1:  new Tone.PolySynth(),
            harmo2:  new Tone.PolySynth(),
            melody: new Tone.PolySynth(),
            bass:   new Tone.Synth(),
            drums:  new Tone.Sampler(),

        }
        this.nodes = {
            quality: new Tone.BitCrusher(8),
            filter: new Tone.Filter(8000,undefined,-24),
            input: new Tone.Synth().toDestination(),
            output: new Tone.Volume(-3).toDestination(),
            effects: new Tone.Sampler()
        }
        const q = this.nodes.quality
        const f = this.nodes.filter
        const o = this.nodes.output
        o.toDestination()
        f.connect(o)  
        q.connect(f)
        q.set({wet:1});
        this.nodes.effects.toDestination()
        this.nodes.effects.volume.value = -6
        this.players.piano.connect(q)
        this.players.lead.connect(q)
        this.players.lead2.connect(q)
        this.players.melody.connect(q)
        this.players.bass.connect(q)
        this.players.drums.connect(q)
        this.players.harmo1.connect(q)
        this.players.harmo2.connect(q)

        this.players.bass.set(midiPresets.bass)
        this.players.melody.set(midiPresets.melody)
        this.players.lead.set(midiPresets.lead)
        this.players.lead2.set(midiPresets.lead2)
        this.players.harmo1.set(midiPresets.harmo1)
        this.players.harmo2.set(midiPresets.harmo2)
        this.players.piano.set(midiPresets.piano)
        this.nodes.input.set(midiPresets.input)

        if(autoload){
            this.loadSampler()
            this.loadEffects()
        }
        this.loaded = null
        this.state = 'clear'
        console.log('new MidiFilePlayer');
    }
    destroy(){
        Tone.Transport.stop();
        Tone.Transport.clear();
        Tone.Transport.cancel();
        this.loaded = null;
        Object.keys(this.players).forEach(p => {
            p.dispose()
        })
        this.players = null;

        Object.keys(this.nodes).forEach(p => {
            p.dispose()
        })
        this.nodes = null;
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
    loadEffects(onProgress){
        return new Promise((resolve)=>{
            this.effectsList = {}
            const keys = effectsSet
            let loaded = 0;
            let note = Tone.Frequency('C1').toMidi()
            const check = ()=>{
                loaded++
                onProgress(keys[loaded],[loaded,keys.length])
                if(loaded === keys.length) resolve(loaded)    
            }
            keys.forEach((k,i) => {
                const n = note + i
                console.log('loading effect sample: ',k.sample)
                this.nodes.effects.add(Tone.Midi(n).toNote(),'Sounds/' + k.sample, check)
                this.effectsList[k.sample] = n
            })
            console.log(this.effectsList)
        })
    }

    load(songList ,onProgress){ 
        this.songs = {}
        this.state = 'loading'
        return new Promise((resolve, reject)=>{
            const count = songList.length
            let loaded = 0;
            let failed = 0; 
            const check = ()=>{
                if(failed === count) {
                    reject()
                    this.state = 'clear'
                }
                if(loaded + failed === count) {
                    this.state = 'loaded'
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
    play(song, handlers, offset = 0, append = false, fade=0.4){
        return new Promise((resolve,reject)=>{
        
        if(!song) {
            reject(); 
            return
        }
        this.stop(fade && this.loaded ? fade : 0).then(()=>{
            console.log('Play->stop: ', this)

            this.prepare(song, (loaded)=>{
                // console.log(loaded)
            },offset,append).then(()=>{
                console.log('Play->prepare: ', this)
                this.unmute()
                this.begin(handlers)
                resolve()
            })   
        });
          
        }) 
    }

    //stop immidiate
    stop(inTime = 0){
        return new Promise((resolve)=>{
            const dt = inTime;
            Tone.Transport.stop(Tone.now() + dt);
            this.nodes.output.volume.linearRampTo(-180,dt);
            console.log('Stop->Will midi stop in:',dt, Tone.now())
            this.state = 'stopping'

            setTimeout(()=>{
                if(this.#onbar) Tone.Transport.clear(this.#onbar);
                if(this.#onbeat) Tone.Transport.clear(this.#onbeat);
                this.pause()
                console.log('Stop->Midi stop', Tone.now())
                Tone.Transport.cancel()
                this.state = 'stopped'
                this.loaded = null;
                resolve()
            },(dt + 0.1) * 1000)
        })
    }

    //being playing previously prepared midi
    begin(handlers){
        if(handlers){
            console.log(handlers)
            if(handlers.onBar) this.#onbar = Tone.Transport.scheduleRepeat((t)=>{Tone.Draw.schedule(handlers.onBar,t)},'1m')
            if(handlers.onBeat) this.#onbeat = Tone.Transport.scheduleRepeat((t)=>{Tone.Draw.schedule(handlers.onBeat,t)},'4n')
        }
        this.nodes.output.volume.value = -3;
        Tone.Transport.start("+0.5","0:0:0");
        this.state = 'playing'
    }

    pause(){
        this.nodes.output.volume.value = -180;
        this.#silenceAll()
        Tone.Transport.stop();
        this.state = 'paused';
    }
    resume(){
        this.nodes.output.volume.value = -3;
        Tone.Transport.toggle()
        this.state = 'playing';
    }

    //pre schedule events before playing
    prepare(song, onProgress, offset = 0, append = false){ 
        if(!song) return
        const midiJson = this.songs[song]
        console.log('Prepare midi: ',song,this.songs)
        
        return new Promise((resolve, reject)=>{
            if(this.loaded?.name === song) {
                console.log('Prepare midi bail')
                resolve(midiJson)
                return
            }
            this.state = 'preparing';
            if(!append) Tone.Transport.cancel();
            Tone.Transport.bpm.value = midiJson.header.tempos[0].bpm
            const off = Tone.TransportTime(offset).toSeconds();
            Tone.Transport.loopEnd = midiJson.duration + off;
            Tone.Transport.loopStart = off;
            Tone.Transport.loop = true;

            const count = midiJson.tracks.length
            let loaded = 0;
            let failed = 0; 
            const check = ()=>{
                console.log('Prepare check ', loaded, failed, {...midiJson})
                if(failed === count) reject()
                if(loaded + failed === count) {
                    let duration = 0
                    midiJson.tracks.forEach(t => {
                        if(t.duration > duration) duration = t.duration
                    })
                    this.loaded = {name: song, duration}
                    this.state = 'perpared'
                    console.log('Prepare Midi loaded')
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


    unmute(tracks = null, inTime = 0){
        const tr = tracks ? tracks : Object.keys(this.players)
        tr.forEach(k => {
            console.log('Unmute ',k)
            this.players[k].volume.linearRampTo(midiPresets[k].volume, inTime);
        })
    }
    mute(tracks = null, inTime = 0){
        const tr = tracks ? tracks : Object.keys(this.players)
        tr.forEach(k => {
            console.log('Mute ',k)
            this.players[k].volume.linearRampTo(-180, inTime);
        })
    }

    getProgress(){
        if(!this.loaded) return 0
        if(this.state !== 'playing') return 0
        return Tone.Time(Tone.Transport.position).toSeconds() /  this.loaded.duration 
    }

    seek(where){
        if(!this.loaded) return 
        if(this.state !== 'playing') return 
        Tone.Transport.position = Tone.Time(where * this.loaded.duration).toBarsBeatsSixteenths() 
    }

    #silenceAll(){
        const poly0 = (p)=>{
            const r = p.options.envelope.release
            p.options.envelope.release = 0
            p.releaseAll()
            p.options.envelope.release = r
            console.log('silence poly')
        }
        const synth0 = (p)=>{
            const r = p.envelope.release
            p.envelope.release = 0
            p.triggerRelease()
            p.envelope.release = r
            console.log('silence synth')
        }
        const duo0 = (p)=>{
            const r0 = p.voice0.envelope.release
            const r1 = p.voice1.envelope.release
            p.voice0.envelope.release = 0
            p.voice1.envelope.release = 0
            p.triggerRelease()
            p.voice0.envelope.release = r0
            p.voice1.envelope.release = r1
            console.log('silence duo')
        }
        const samp0 = (p)=>{
            const r = p.release
            p.release = 0
            p.releaseAll()
            p.release = r
            console.log('silence sampler')
        }


        Object.keys(this.players).forEach(k => {
            const p = this.players[k]
            if(p instanceof Tone.Synth) synth0(p)
            if(p instanceof Tone.DuoSynth) duo0(p)
            if(p instanceof Tone.PolySynth) poly0(p)
            if(p instanceof Tone.Sampler) samp0(p)
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

export async function startPitchGameSong (levelData,onGametick, onGameBar){
    if(gameTickId) await endGameSong()

    return new Promise(async (resolve)=>{

        await midiPlayer.stop();
        Tone.Transport.position = '0:0:0';
        await midiPlayer.prepare(levelData.song,null,'1:0:0',true)
        
        const countdown = new Tone.Pattern((t,n)=>{
            midiPlayer.players.drums.triggerAttackRelease(n,'8n',t)
        },['F#2','F#2','F#2','D#3']).start('0:0:0').stop('1:0:0')
        gameTickId = Tone.Transport.scheduleRepeat((t)=>{
            Tone.Draw.schedule(()=>{
                onGametick()
            },t)
        }, levelData.gameTickInterval, '1:0:0')
        Tone.Transport.scheduleOnce((t)=>{
            Tone.Draw.schedule(resolve,t)
        },'1:0:0')
        if(onGameBar){
            Tone.Transport.scheduleRepeat(()=>{
                Tone.Draw(()=>{onGameBar()})
            },'1m','0:0:0');
        }
        console.log('startPitchGameSong prepare countdown')
        midiPlayer.begin()
        midiPlayer.mute();
        midiPlayer.unmute(['bass','drums'])  

    })
}

export function endGameSong(){
    return new Promise((resolve)=>{
        Tone.Transport.clear(gameTickId)
        gameTickId = null
        midiPlayer.stop(1.5).then(()=>{
            resolve();
        });
    })
}

export function setGameSongPitch(root, force = false){
    const newRoot = Tone.Frequency(root).toMidi() % 12

    const when = QuanTime(Tone.Transport.position,4,4)
    console.log(Tone.Transport.position, '->', when)
    if(!force) {
        Tone.Transport.scheduleOnce((tt)=>{
            midiPlayer.transpose(newRoot)
        }, Tone.Time(when).toSeconds() - 0.05)
    }
    else 
        midiPlayer.transpose(newRoot)
}

export function setGameSongParts(instrumentSelection){
    midiPlayer.mute(null,2);
    midiPlayer.unmute(instrumentSelection,2);
    console.log('new game parts', instrumentSelection)
}

export function playSoundEffect(name){
    const n = midiPlayer.effectsList[name]
    if(n){
        midiPlayer.nodes.effects.triggerAttackRelease(Tone.Midi(n).toNote(),'1n')
    }
    else console.log("Effect sound not found ", name)
}

export function playGameInput(note){
    midiPlayer.nodes.input.triggerAttackRelease(note,'8n','@8n');
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