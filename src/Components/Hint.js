import { useState } from "react"

export default function HintedDiv({children,hintComponent,hide = false,className,...restProps}){
    const [tries, setTries] = useState(0)
    const [hover,setHover] = useState(false)
    return <div className={'Hinted ' + className} 
        onPointerEnter={()=>{
            setHover(true)
        }}
        onPointerLeave={()=>{
            setHover(false)
            setTries(t => t+1)
        }}
        {...restProps}
    >
        {children}
        {!hide && hover && hintComponent}
        {/* {!hide && hover && tries > 2 && hintComponent} */}
    </div>
}