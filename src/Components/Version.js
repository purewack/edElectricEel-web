export const versionText = 'S/W/D/2'
export default function VersionTag(){
    return <span className='VersionTag' style={{
        fontSize: '20px',
        color: 'honeydew',
        filter: 'drop-shadow(1px 1px 0px black)'
    }}>{versionText}</span>
}

export function PatchNotes(){
    return <>
    <details>
        <summary>{'S/W/D/2'}</summary>
        <ul>
            <li className='new'>Base game version with pitch game</li>
        </ul>
    </details>
    <p>Past:</p>
    <details>
        <summary>{'S/W/D/1'}</summary>
        <ul>
            <li>Test game with piano and note identification</li>
        </ul> 
    </details>
    </>
}