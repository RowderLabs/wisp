import { Modal } from "@wisp/ui";
import { HiClipboardList } from "react-icons/hi";

export default function TraitMenu() {
  return (
    <Modal trigger={<HiClipboardList />}>
      <div className="flex px-4 py-6 gap-8">
        {/**Side Menu */}
        <ul className="flex flex-col gap-4 basis-[200px]">
          <li className="p-2 border-b-2">Item 1</li>
          <li className="p-2 border-b-2">Item 1</li>
          <li className="p-2 border-b-2">Item 1</li>
          <li className="p-2 border-b-2">Item 1</li>
          <li className="p-2 border-b-2">Item 1</li>
          <li className="p-2 border-b-2">Item 1</li>
        </ul>
        {/**Traits*/}
        <div className="max-h-[400px] overflow-auto basis-full">
          {/**Header*/}
          <div className="flex w-full items-start justify-between mb-4">
            {/**Header Left*/}
            <div>
              <p className="font-semibold text-lg">Personal Information</p>
              <div className="flex gap-4 text-blue-400">
                <button>+ Add Note</button>
                <button>+ Add Bio</button>
              </div>
            </div>
            {/**Header Right*/}
            <button className="mt-2 rounded-md border-2 border-blue-200 bg-blue-100 px-5 py-1 hover:bg-blue-200 hover:shadow-md">
              Add Trait
            </button>
          </div>
          {/*Traits*/}
          <ul className="flex flex-col gap-4 px-2">
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
            {/*Trait*/}
            <li className="flex justify-between">
              <div>
                <span>Trait Name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-64 border-4 border-dotted" />
                <button className="text-slate-400">✓</button>
                <button className="text-red-400">✗</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
