import { useIsFirstRender } from "@uidotdev/usehooks";
import { rspc, useUtils } from "@wisp/client";
import { Fact } from "@wisp/client/src/bindings";
import { Button, Form, InputField } from "@wisp/ui";
import { useZodForm } from "@wisp/ui/src/hooks";
import { useEffect } from "react";
import { z } from "zod";

const formSchema = z.object({ fields: z.record(z.string(), z.string().or(z.string().array())) });

interface FactFormProps {
  facts: Fact[];
  entityId: string;
}

export function FactForm({ facts, entityId }: FactFormProps) {
  const form = useZodForm({
    schema: formSchema,
    defaultValues: { fields: Object.fromEntries(facts.map((fact) => [fact.name, fact.value])) }
  });
  const isFirstRender = useIsFirstRender()

  useEffect(() => {
    if (!isFirstRender) {
      form.reset({ fields: Object.fromEntries(facts.map((fact) => [fact.name, fact.value])) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facts])

  const utils = useUtils();

  const { mutate: submitFacts } = rspc.useMutation(['facts.update_many'], {
    onSuccess: () => {
      utils.invalidateQueries(['facts.on_entity']);
      utils.invalidateQueries(['facts.slice']);
    },
  });

  return (
    <Form
      form={form}
      onSubmit={(fData) => {
        const changed = Object.entries(fData.fields)
          .filter(([key]) => {
            const dirtyFields = form.formState.dirtyFields.fields;
            return dirtyFields && dirtyFields[key] === true;
          })
          .map(([key, entry]) => ({ value: entry, name: key }));
        submitFacts({ entity_id: entityId, fields: changed });
      }}
    >
      <div className="p-4 bg-white rounded-md grid grid-cols-2 items-center gap-4 max-w-[1200px]">
        {facts.map((fact) => {
          return (
            <>
              <p className="font-semibold">{fact.name}</p>
              <InputField
                key={fact.name}
                id={fact.name}
                {...form.register(`fields.${fact.name}`)}
              />
            </>
          );
        })}
      </div>
      <Button variant="outline" type="submit">
        Submit
      </Button>
    </Form>
  );
}

