import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate({from: '/'});
  useEffect(() => {
    navigate({to: '/workspace'})
  }, [])
  return <Outlet />;
}
