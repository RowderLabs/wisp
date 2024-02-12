import React from 'react'
import {ZodSchema} from 'zod'

export abstract class Panel<P, D> {
    protected __props: P;
  
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