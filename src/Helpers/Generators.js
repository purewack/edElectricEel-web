import { getRandomFrom } from "./Hooks";

export function pickNoteFromPoolAvoid(pool,avoid){
    let note;
    let dupe;
    let lim;
    let _pool = [...pool]
    do{
      dupe = false
      note = getRandomFrom(_pool)
      for(let i=0; i<avoid.length; i++){
          if(avoid[i] === note) {
            dupe = true
            _pool = _pool.filter(p=>p!==note)
            break
          }
      }
      if(!dupe) return note
      if(_pool.length === 1) return _pool[0]
    }while(dupe)
    return note
}

export function getClefFromProbability(clefs){
    const cc = clefs
    const trebleWeight = cc.treble ? cc.treble : 0
    const altoWeight = cc.alto ? cc.alto : 0
    const bassWeight = cc.bass ? cc.bass : 0

    let clefPool = []
    for(let i=0; i<Math.trunc(trebleWeight*100); i++)
        clefPool.push(0)
    for(let i=0; i<Math.trunc(altoWeight*100); i++)
        clefPool.push(1)
    for(let i=0; i<Math.trunc(bassWeight*100); i++)
        clefPool.push(2)

    // console.log(clefPool)

    const rng = getRandomFrom(clefPool)
    if(rng === 0) return 'treble'
    if(rng === 1) return 'alto'
    if(rng === 2) return 'bass'
}