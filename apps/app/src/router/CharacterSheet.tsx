import { PanelCanvas } from '@wisp/ui'
import {CharacterSummary} from '../ui/CharacterSummary'
import { useParams } from '@tanstack/react-router'
import { rspc } from '../rspc/router'


export function CharacterSheet() {
    const { characterId } = useParams({ strict: false })
    const { data: character } = rspc.useQuery(['characters.with_id', parseInt(characterId)])
    return (
        <>
            <div style={{ height: "800px" }} className="basis-full h-full">
                <PanelCanvas />
            </div>
            {character && <CharacterSummary name={character?.fullName} />}
        </>
    )
}
