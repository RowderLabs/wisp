import React from 'react'

type AttributePanelItemProps = {
    label: string,
    attribute: string
}


export const AttributePanelItem = ({label, attribute}: AttributePanelItemProps) => {
    return (
        <div className="text-sm grid gap-6 grid-cols-2 break-words border-b">
            <p>{label}</p>
            <p>{attribute}</p>
        </div>
    )
}
