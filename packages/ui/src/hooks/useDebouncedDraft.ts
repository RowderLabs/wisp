import { useDebounce } from "@uidotdev/usehooks"
import React from "react"

export type UseDebouncedDraftArgs<T> = {
    callback: (draft: T) => void
    duration?: number
}

export function useDebouncedDraft<T>({duration = 500, callback}: UseDebouncedDraftArgs<T>) {
    const [draft, setDraft] = React.useState<T>()
    const debouncedDraft = useDebounce<T | undefined>(draft, duration)

    React.useEffect(() => {
        if (debouncedDraft) callback(debouncedDraft)
    }, [debouncedDraft])

    return [draft, setDraft] as const

}