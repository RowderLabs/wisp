import { ImageUploader, ImageUploadOverlay, Divider } from "@wisp/ui";
import WispEditor from "./WispEditor";
import { AttributePanel } from "./AttributePanel";

type CharacterSummaryProps = {
  name: string
};

export default function CharacterSummary({ name }: CharacterSummaryProps) {
  return (
    <div style={{ height: "800px" }} className="basis-[400px] h-full bg-white p-8 mt-4 rounded-md">
      {/**transformed content */}
      <div className="flex flex-col gap-2 transform -translate-y-36">
        {/**character picture */}
        <ImageUploader
          wrapperStyle={{
            height: "150px",
            width: "150px",
            border: "1px solid white",
            borderRadius: "8px",
          }}
        >
          {({ wrapperStyle, ...props }) => (
            <div style={wrapperStyle} className="mx-auto bg-slate-200">
              <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
            </div>
          )}
        </ImageUploader>
        {/**Name */}
        <h2 className="font-semibold text-slate-700 text-lg mx-auto">{name}</h2>
        <Divider />
        {/**Bio*/}
        <p className="font-semibold text-slate-700">Bio</p>
        <div className="h-36 rounded-md">
          <WispEditor />
        </div>
        <Divider />
        <AttributePanel
          attributes={[
            { name: "Attr 1", value: "Value 1" },
            { name: "Attr 2", value: "Value 2" },
            { name: "Attr 3", value: "Value 3" },
          ]}
          title="Characteristics"
        >
          {({ name, value }) => (
            <div key={name} className="flex justify-between border-b">
              <p>{name}</p>
              <p>{value}</p>
            </div>
          )}
        </AttributePanel>
        <Divider />
      </div>
    </div>
  );
}
