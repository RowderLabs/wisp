import React, { PropsWithChildren } from 'react'
import { AttributePanelItem } from './AttributePanelItem'

export const AttributePanel: React.FC<PropsWithChildren> = () => {
    return (
        <div className="w-[400px] flex flex-col gap-4 rounded-md border p-6">
            <div className="px-4 font-semibold bg-blue-500 text-white py-2 rounded-md">
                <p>
                    Basic Info
                </p>
            </div>
            <div className="px-4 flex flex-col gap-4">
                <AttributePanelItem label="Occupation" attribute="Ghost Hunter" />
                <AttributePanelItem label="Pronouns" attribute="She/Her"/>
                <AttributePanelItem label="Astrology Sign" attribute="Cancer"/>
                <AttributePanelItem label="Favorite Video Game" attribute="The Sims"/>
            </div>
        </div>
    )
}
