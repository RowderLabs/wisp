import React, { PropsWithChildren } from 'react'
import { AttributePanelItem } from './AttributePanelItem'

export const AttributePanel: React.FC<PropsWithChildren> = () => {
    return (
        <div className="w-[400px] mt-12 flex flex-col gap-4 rounded-md border p-6">
            <div>
                <p className="font-semibold">Basic Info</p>
            </div>
            <div className="flex flex-col gap-4">
                <AttributePanelItem label="Occupation" attribute="Ghost Hunter" />
                <AttributePanelItem label="Pronouns" attribute="She/Her"/>
                <AttributePanelItem label="Astrology Sign" attribute="Cancer"/>
                <AttributePanelItem label="Favorite Video Game" attribute="The Sims"/>
            </div>
        </div>
    )
}
