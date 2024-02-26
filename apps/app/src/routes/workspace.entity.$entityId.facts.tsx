import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";
import { FactManager } from "../components/FactManager";
import { EntityTypeSchema } from "./workspace.entity.$entityId.index";

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
  return (
    <FactManager entityId={params.entityId} entityType={searchParams.type}/>
  )
}