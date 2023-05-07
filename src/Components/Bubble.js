import '../Styles/Bubble.css'

export default function Bubble({stemDirection = undefined, children, className}){
  
    if(stemDirection){
        const stem = stemDirection[0].toUpperCase() + stemDirection.slice(1)
        return <div className={`Bubble Stem ${stem} ${className}`}>
            {children}
        </div>
    }
    else {
        return <div className={`Bubble ${className}`}>
            {children}
        </div> 
    }
}