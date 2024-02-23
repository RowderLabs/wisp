import { rspc } from "@wisp/client";
import { FactGroup } from "@wisp/client/src/bindings";
import { Button, Form, InputField } from "@wisp/ui";
import { useZodForm } from "@wisp/ui/src/hooks";
import { z } from "zod";

const formSchema = z.object({ fields: z.record(z.string(), z.string()) });

interface FactFormProps {
  group: FactGroup;
  entityId: string;
}
export function FactGroupForm({ group, entityId }: FactFormProps) {
  const form = useZodForm({
    schema: formSchema,
  });

  const {data: factsOnCharacter} = rspc.useQuery(['facts.facts_on', entityId])
  const { mutate: submitFacts } = rspc.useMutation(["facts.update_many"]);

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

        form.reset();
      }}
    >
      <div className="p-8 bg-white rounded-md border grid grid-cols-2 items-center gap-4 text-sm max-w-[600px]">
        <div>{JSON.stringify(factsOnCharacter)}</div>
        {group.facts.map((fact) => {
          return (
            <>
              <p>{fact.name}</p>
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
