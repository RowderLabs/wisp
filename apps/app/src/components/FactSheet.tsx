type FactValue = {
  text: string;
  attr: string[];
};

type Fact = {
  [K in keyof FactValue]: { factKey: string; value: FactValue[K], type: K };
};
type FactRenderer = {
  [K in keyof Fact]: (props: Fact[K]) => React.ReactElement;
};

const createFact: FactRenderer = {
  text: (props) => <TextFact {...props} />,
  attr: (props) => <AttrFact {...props} />,
};
function Fact<T extends keyof FactRenderer>({ fact, type }: { type: T; fact: Fact[T] }) {
  return createFact[type](fact);
}

function TextFact({ factKey, value }: { factKey: string; value: FactValue["text"] }) {
  return (
    <div className="p-2 flex justify-between items-center border-b">
      <p>{factKey}</p>
      <p>{value}</p>
    </div>
  );
}

function AttrFact({ factKey, value }: { factKey: string; value: FactValue["attr"] }) {
  return (
    <div className="p-2 flex justify-between items-center border-b">
      <p>{factKey}</p>
      <div className="flex gap-0.5">
        {value.map((attr) => (
          <span className="rounded-md border p-1" key={factKey}>
            {attr}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FactSheet({facts}: {facts: (Fact['text'] | Fact['attr'])[]}) {
  return (
    <div className="bg-white w-full h-full rounded-md border text-sm p-8 mx-auto flex flex-col gap-2">
      {facts.map((fact) => (
        <Fact key={fact.factKey} type={fact.type} fact={fact} />
      ))}
    </div>
  );
}
