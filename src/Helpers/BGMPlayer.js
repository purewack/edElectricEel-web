import * as Tone from 'tone'

export default class BGMPlayer {
    constructor(){
        this.songs = new Tone.ToneAudioBuffers();
        this.players = [
            new Tone.Player().toDestination(), 
            new Tone.Player().toDestination()
        ];
        this.player = this.players[0];
        this.players[0].loop = true;
        this.players[1].loop = true;
        ////console.log('new BGMPlayer')
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
        ////console.log('started @ ',Tone.now())
    }
    stop(inTime = 0.5){
        if(!inTime){
            this.player.stop(Tone.now());
            return;
        }
        const dt = inTime;
        const player = this.player
        ////console.log('stopping @ ',Tone.now())
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
