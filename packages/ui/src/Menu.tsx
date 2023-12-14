import React, { PropsWithChildren } from "react";

type MenuProps = {
  className?: string
}

export function Menu({ className, children }: PropsWithChildren<MenuProps>) {
  return <ul className={className}>{children}</ul>;
}

interface MenuItemProps extends React.ComponentProps<'li'> {
}

export function MenuItem({children, className, onClick}: PropsWithChildren<MenuItemProps>) {
  return (
    <li className={className}>{children}</li>
  )
}
