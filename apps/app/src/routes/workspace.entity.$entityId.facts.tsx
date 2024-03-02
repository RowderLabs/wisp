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
      {tags?.map(t => <p className="inline-block rounded-full p-0.5 text-sm font-semibold bg-blue-100 text-blue-400" key={t.tagId}>{t.tag.name}</p>)}
     <FactManager entityId={params.entityId} entityType={searchParams.type}/>
     <Link to="/workspace/entity/tree">Tree</Link>
    </>
   
  )
}