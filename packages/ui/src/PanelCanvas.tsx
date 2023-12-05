export function PanelCanvas() {
    return (
        <div className="border p-2 relative flex justify-center items-center w-full h-full">
            <div className="absolute top-4 left-4 border h-10 rounded-md flex gap-1 p-0.5">
                <span className="rounded-md h-full w-8 bg-slate-300"></span>
                <span className="rounded-md h-full w-8 bg-slate-300"></span>
                <span className="rounded-md h-full w-8 bg-slate-300"></span>
                <span className="rounded-md h-full w-8 bg-slate-300"></span>
                <span className="rounded-md h-full w-8 bg-slate-300"></span>
            </div>
            <div>
                Canvas Items
            </div>

        </div>
    )
}