import { cva } from "class-variance-authority";
import React from "react";
import { FormField, UseFormFieldProps, useFormField } from "./Form";

const inputVariants = cva([
  "px-2 py-1 border border-slate-300 rounded-md min-w-[250px] w-full h-full",
  "placeholder-slate-500 placeholder-text-xs",
  "focus:outline-none focus:ring focus:ring-slate-200",
]);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function (props, ref) {
  return <input ref={ref} {...props} className={inputVariants()} type="text" />;
});

interface InputFieldProps extends Omit<InputProps, "name" | "label" | "id">, UseFormFieldProps {}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(function (props, ref) {
  const {primitiveProps, fieldProps} = useFormField(props)
  return (
     <FormField {...fieldProps}><Input {...primitiveProps} ref={ref} {...props} /></FormField>
  );
});
