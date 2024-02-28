import { useIsFirstRender } from "@uidotdev/usehooks";
import { rspc, useUtils } from "@wisp/client";
import { Fact } from "@wisp/client/src/bindings";
import { Form, InputField } from "@wisp/ui";
import { useZodForm } from "@wisp/ui/src/hooks";
import { useCallback, useEffect } from "react";
import { z } from "zod";
import { SubmitHandler } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";

const formSchema = z.object({ fields: z.record(z.string(), z.string().or(z.string().array())) });

interface FactFormProps {
  facts: Fact[];
  entityId: string;
}

export function FactForm({ facts, entityId }: FactFormProps) {
  const form = useZodForm({
    schema: formSchema,
    defaultValues: { fields: Object.fromEntries(facts.map((fact) => [fact.id, fact.value])) },
  });
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!isFirstRender) {
      form.reset({ fields: Object.fromEntries(facts.map((fact) => [fact.id, fact.value])) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facts]);

  const utils = useUtils();

  const { mutate: submitFacts } = rspc.useMutation(["facts.update_many"], {
    onSuccess: () => {
      utils.invalidateQueries(["facts.on_entity"]);
      utils.invalidateQueries(["facts.slice"]);
    },
  });
  const submitHandler: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    console.log("submitting...");
    const changed = Object.entries(data.fields)
      .filter(([key]) => {
        const dirtyFields = form.formState.dirtyFields.fields;
        return dirtyFields && dirtyFields[key] === true;
      })
      .map(([key, entry]) => ({ value: entry, id: key }));
    submitFacts({ entity_id: entityId, fields: changed });
  };

  const debouncedSubmit = useDebounceCallback(submitHandler, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(() => form.handleSubmit(debouncedSubmit)(), []);

  //TODO: debounced submit hook
  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isValid && !form.formState.isValidating) {
        handleSubmit();
      }
    });
    return () => subscription.unsubscribe();
  }, [handleSubmit, form]);
  return (
    <Form form={form}>
      <div className="p-4 bg-white rounded-md grid grid-cols-2 items-center gap-4 max-w-[1200px]">
        {facts.map((fact) => {
          if (fact.type === "text") {
            return (
              <>
                <p className="font-semibold">{fact.name}</p>
                <InputField key={fact.id} id={fact.id} {...form.register(`fields.${fact.id}`)} />
              </>
            );
          }
          else return null
        })}
      </div>
    </Form>
  );
}
