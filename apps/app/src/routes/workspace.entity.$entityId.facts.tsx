import { Link, createFileRoute } from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";
import { FactManager } from "../components/FactManager";
import { EntityTypeSchema } from "./workspace.entity.$entityId.index";
import { rspc } from "@wisp/client";

export const Route = createFileRoute("/workspace/entity/$entityId/facts")({
  staticData: {
    routeBreadcrumb: "character-page",
  },
  validateSearch: EntityTypeSchema,
  notFoundComponent: () => <NotFound />,
  component: EntityFactsPage,
});

function EntityFactsPage() {
  const params = Route.useParams()
  const searchParams = Route.useSearch()
  const {data: tags} = rspc.useQuery(['tags.on_entity', params.entityId])
  return (
    <>
     <FactManager entityId={params.entityId} entityType={searchParams.type}/>
     <Link to="/workspace/entity/tree">Tree</Link>
    </>
   
  )
}