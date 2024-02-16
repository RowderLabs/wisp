import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"


type ToggleEditablePluginProps = {
  editable?: boolean
  onEditableChange?: (status: boolean) => void
}
export function ToggleEditablePlugin({editable, onEditableChange}: ToggleEditablePluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(editable ?? true)
  }, [editor, editable])

  useEffect(() => {
    return editor.registerEditableListener((canEdit) => {
      if (onEditableChange) onEditableChange(canEdit)
    })
  }, [editor])

  return null

}