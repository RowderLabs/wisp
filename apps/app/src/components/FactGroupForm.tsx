import { FactGroup } from "@wisp/client/src/bindings";
import { Button, Form, InputField } from "@wisp/ui";
import { useZodForm } from "@wisp/ui/src/hooks";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({ fields: z.record(z.string(), z.string()) });


export function FactGroupForm({ group }: { group: FactGroup }) {
  const form = useZodForm({
    schema: formSchema,
    defaultValues: { fields: { "First Name": "Matt", "Last Name": "Reid" } },
  });

  const [fData, setFData] = useState<any>();

  return (
    <Form
      form={form}
      onSubmit={(fData) => {
        const changed = Object.fromEntries(
          Object.entries(fData.fields).filter(
            ([key]) => {
              const dirtyFields = form.formState.dirtyFields.fields
              return dirtyFields && dirtyFields[key] === true
            }
          ).map(([key, entry]) => [key, entry])
        );

        setFData(changed);
      }}
    >
      <div className="p-8 bg-white rounded-md border grid grid-cols-2 items-center gap-4 text-sm max-w-[600px]">
        {group.facts.map((fact) => {
          return (
            <>
              <p>{fact.key}</p>
              <InputField key={fact.key} id={fact.key} {...form.register(`fields.${fact.key}`)} />
            </>
          );
        })}
      </div>
      <p>{JSON.stringify(fData)}</p>
      <Button variant="outline" type="submit">
        Submit
      </Button>
    </Form>
  );
}
