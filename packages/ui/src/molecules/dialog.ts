import { createScope, molecule } from "bunshi/react";
import { atom } from "jotai";

export type FirstParam<T extends (...args: any) => any> = Parameters<T>[0];
type DialogErrorEnum = "REGISTER_ERROR" | "UNREGISTER_ERROR" | "ACTION_ERROR";
type DialogManagerErrorMessage =
  | `Attempted to ${string}, but ${string}`
  | `Attempted to ${string}, but`;

export const DialogProviderScope = createScope(undefined);
const UNKNOWN_FAILURE_CAUSE = "the manager failed for an unknown reason" as const;

class DialogManagerError extends Error {
  timestamp: Date;
  type: DialogErrorEnum;

  constructor(message: DialogManagerErrorMessage, type: DialogErrorEnum) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = message;
    this.type = type;
    this.timestamp = new Date();
  }
}

type DialogState = {
  active: boolean;
  component: React.FC<any>;
  props: any;
};

export const DialogMolecule = molecule((_, scope) => {
  scope(DialogProviderScope);
  const $dialogs = atom<Record<string, DialogState>>({});

  const createManagerErrorMessage = ({
    action,
    errorCause,
  }: {
    action: string;
    errorCause?: string;
  }): DialogManagerErrorMessage => {
    return `Attempted to ${action}, but ${errorCause ? errorCause : UNKNOWN_FAILURE_CAUSE}`;
  };

  const formatLogMessage = (type: DialogErrorEnum, message: string) => {
    return `[${type}]: ${message} [${new Date().toISOString()}]`;
  };

  const _safeModifyDialogs = <TFunc extends (arg: any) => any, UParam extends FirstParam<TFunc>>(
    callback: TFunc,
    param: UParam
  ) => {
    try {
      callback(param);
    } catch (err) {
      if (err instanceof DialogManagerError) {
        console.error(formatLogMessage(err.type, err.message));
      }
    }
  };

  const $registerDialog = atom(
    null,
    (get, set, update: { id: string; component: React.FC<any>; props: any }) => {
      const dialogs = get($dialogs);
      const subject = dialogs[update.id];
      //todo: add warning
      if (subject) {
        throw new DialogManagerError(
          createManagerErrorMessage({
            action: `register dialog ${update.id}`,
            errorCause: `dialog ${update.id} already exists.`,
          }),
          "REGISTER_ERROR"
        );
      }
      set($dialogs, {
        ...get($dialogs),
        [`${update.id}`]: { active: true, component: update.component, props: update.props },
      });
    }
  );

  const $dialogsState = atom((get) => get($dialogs));
  const $unregisterDialog = atom(null, (get, set, update: { id: string }) => {
    const dialogs = { ...get($dialogs) };
    const subject = dialogs[update.id];
    //todo: throw error here
    if (!subject) {
      throw new DialogManagerError(
        createManagerErrorMessage({
          action: `unregister dialog ${update.id}`,
          errorCause: `dialog ${update.id} does not exist`,
        }),
        "UNREGISTER_ERROR"
      );
    }
    delete dialogs[update.id];
    set($dialogs, dialogs);
  });

  return { $registerDialog, $unregisterDialog, $dialogsState, _safeModifyDialogs };
});
