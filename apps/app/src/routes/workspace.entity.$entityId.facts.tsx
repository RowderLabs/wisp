import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";
import { FactManager } from "../components/FactManager";
import { EntityTypeSchema } from "./workspace.entity.$entityId.index";
import { rspc } from "@wisp/client";
import { PropsWithChildren } from "react";

export const Route = createFileRoute("/workspace/entity/$entityId/facts")({
  staticData: {
    routeBreadcrumb: "character-page",
  },
  validateSearch: EntityTypeSchema,
  notFoundComponent: () => <NotFound />,
  component: EntityFactsPage,
});

function EntityFactsPage() {
  const params = Route.useParams();
  const searchParams = Route.useSearch();
  const { data: tags } = rspc.useQuery(["tags.on_entity", params.entityId]);
  return (
    <>
      {tags?.map((t) => (
        <p className="inline-block rounded-full p-0.5 text-sm font-semibold bg-blue-100 text-blue-400" key={t.tagId}>
          {t.tag.name}
        </p>
      ))}
      <FactManager entityId={params.entityId} entityType={searchParams.type} />

      <div className="tree overflow-x-auto w-[1500px]">
        <HierarchyLevel>
          <HierarchyGroup>
            <HierarchyNode>Parent A</HierarchyNode>
            <HierarchyNode>Parent A</HierarchyNode>
            <HierarchyLevel>
              <HierarchyGroup>
                <HierarchyNode>Child A</HierarchyNode>
                <HierarchyNode>Spouse A</HierarchyNode>
                <HierarchyLevel>
                  <HierarchyGroup>
                    <HierarchyNode>GC A</HierarchyNode>
                  </HierarchyGroup>
                  <HierarchyGroup>
                    <HierarchyNode>GC A</HierarchyNode>
                  </HierarchyGroup>
                  <HierarchyGroup>
                    <HierarchyNode>GC A</HierarchyNode>
                  </HierarchyGroup>
                  <HierarchyGroup>
                    <HierarchyNode>GC A</HierarchyNode>
                  </HierarchyGroup>
                </HierarchyLevel>
              </HierarchyGroup>
              <HierarchyGroup>
                <HierarchyNode>Child B</HierarchyNode>
                <HierarchyNode>Spouse B</HierarchyNode>
              </HierarchyGroup>
              <HierarchyGroup>
                <HierarchyNode>Child C</HierarchyNode>
                <HierarchyLevel>
                  <HierarchyGroup>
                    <HierarchyNode>GrandChild C</HierarchyNode>
                    <HierarchyNode>Spouse GrandChild C</HierarchyNode>
                    <HierarchyLevel>
                      <HierarchyGroup>
                        <HierarchyNode>GG A</HierarchyNode>
                      </HierarchyGroup>
                      <HierarchyGroup>
                        <HierarchyNode>GG A</HierarchyNode>
                      </HierarchyGroup>
                      <HierarchyGroup>
                        <HierarchyNode>GG A</HierarchyNode>
                      </HierarchyGroup>
                    </HierarchyLevel>
                  </HierarchyGroup>
                </HierarchyLevel>
              </HierarchyGroup>
            </HierarchyLevel>
          </HierarchyGroup>
        </HierarchyLevel>
      </div>
    </>
  );
}

function HierarchyGroup(props: PropsWithChildren) {
  return <li className="node-group">{props.children}</li>;
}

function HierarchyLevel(props: PropsWithChildren) {
  return <ul className="level-separator">{props.children}</ul>;
}

function HierarchyNode(props: PropsWithChildren) {
  return <div className="node">{props.children}</div>;
}
