import { useState } from "react"

export default function HintedDiv({children,hintComponent,hide = false,className,...restProps}){

    const [hover,setHover] = useState(false)
    return <div className={'Hinted ' + className} 
        onPointerEnter={()=>{setHover(true)}}
        onPointerLeave={()=>{setHover(false)}}
        {...restProps}
    >
        {children}
        {!hide && hover && hintComponent}
    </div>
}