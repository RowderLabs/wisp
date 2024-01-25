import { useHistoryState } from "@uidotdev/usehooks";

export function useCommandSystem<TState, UAction>(
  commandReducer: (state: TState, action: UAction) => TState,
  initialState: TState
) {

  const {state, undo, redo, set} = useHistoryState(initialState)
  const executeCommand = (action: UAction) => {
    set(commandReducer(state, action))
  }

  return {
    state,
    undo,
    redo,
    executeCommand
  }

}
