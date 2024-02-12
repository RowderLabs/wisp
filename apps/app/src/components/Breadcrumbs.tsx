import { Link, useMatches } from "@tanstack/react-router";
import { HiChevronRight } from "react-icons/hi2";

export function Breadcrumbs() {
  const matches = useMatches();
  const getLast = (pathname: string) => {
    const splitPath = pathname.split("/");
    return splitPath[splitPath.length - 1];
  };

  return (
    <div className="flex gap-2 p-2">
      {matches
        .filter((match) => typeof match.staticData.routeBreadcrumb === "string")
        .map((match) => (
          <BreadcrumbLink path={match.pathname} name={getLast(match.pathname)} key={match.id} />
        ))}
    </div>
  );
}

function BreadcrumbLink({ path, name }: { path: string; name: string }) {
  return (
    <Link className="flex gap-1 items-center inline-block underline text-sm" to={path}>
        <span>{name}</span>
        <HiChevronRight/>
    </Link>
  );
}
