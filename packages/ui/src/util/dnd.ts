import { UniqueIdentifier } from "@dnd-kit/core";

export namespace DndValidation {
    export function idStartsWith(activeId: UniqueIdentifier | undefined, pattern: string): boolean {
        if (!activeId) return false;
        return String(activeId).startsWith(pattern);
      }
}