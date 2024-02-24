import React from 'react'
import {ZodSchema} from 'zod'
import { TextboxPanel } from './textbox';
import { ImagePanel } from './image';


export interface PanelContract<InitProps, ServerProps> {
  getType: () => string;
  getClientProps(props: InitProps): Omit<PanelContract<InitProps, ServerProps>, 'getClientProps'>
  getServerProps(json: string | null): Omit<PanelContract<InitProps, ServerProps>, 'fromJSON'>
  render(): React.ReactElement<unknown> | null
}


export abstract class Panel<P, D> {
    protected __props: P;
    abstract type: string
  
    constructor(props: P) {
      this.__props = props;
    }
  
    __parseJSONProps(
      json: string | null,
      schema: ZodSchema<D>,
      customParser?: any
    ): D | null {
      if (!json) return null;
      const jsonProps = customParser ? customParser(json) : JSON.parse(json);
      return schema.parse(jsonProps);
    }
  
    abstract renderFromJSON(json: string | null): React.ReactElement<unknown> | null;
  }


  const register = [TextboxPanel, ImagePanel] as const

  function mapFromRegister<T extends Panel<any, any>>(register: T[]) {
    return Object.fromEntries(register.map(panel => [panel.type, panel]))

  }
