import { ComponentProps, PropsWithChildren, ReactNode, useEffect, useId } from "react";
import { FieldValues, FormProvider, SubmitHandler, UseFormReturn } from "react-hook-form";
import { Label } from "./Label";
import { useFormContext, get, FieldErrors } from "react-hook-form";

interface Props<T extends FieldValues> extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
}

export const Form = <T extends FieldValues>({ form, onSubmit, children, ...props }: Props<T>) => (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
      <fieldset>{children}</fieldset>
    </form>
  </FormProvider>
);

export interface UseFormFieldProps extends PropsWithChildren {
  id: string;
  name: string;
  label?: string | ReactNode;
}

export const useFormField = <P extends UseFormFieldProps>(props: P) => {
  const { name, label, ...primitiveProps } = props;
  const { formState, getFieldState } = useFormContext();
  useEffect(() => {}, []);
  const state = getFieldState(props.name, formState);
  const id = useId();

  return {
    fieldProps: {
      id,
      name,
      label,
      errorMessage: state.error?.message,
    },
    primitiveProps,
  };
};

export const FormField = ({
  label,
  name,
  children,
  errorMessage,
}: PropsWithChildren<ReturnType<typeof useFormField>["fieldProps"]>) => {
  return (
    <div>
      <div className="flex flex-col gap-1">
        {label && <Label htmlFor={name}>{label}</Label>}
        {children}
      </div>
      {errorMessage && <p className="text-xs text-red-500 my-1">{errorMessage}</p>}
    </div>
  );
};
