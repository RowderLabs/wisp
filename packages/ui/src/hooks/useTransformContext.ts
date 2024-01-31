import { TransformScope } from "../Transform";
import invariant from 'tiny-invariant'
import { useMolecule, molecule } from "bunshi/react";

const TransformMolecule = molecule((_, scope) => {
    const init = scope(TransformScope)
    invariant(init, "No transform context specified")
    const {id, onTransform, transform} = init;

    return {id, transform, onTransform}

})
export function useTransformContext() {
    const {id, transform} = useMolecule(TransformMolecule)

    return {id, transform}
}