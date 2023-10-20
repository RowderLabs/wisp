import React, { FC, PropsWithChildren } from 'react'

export const Menu: FC<PropsWithChildren> = ({children}) => {
  return (
    <ul className='rounded-md text-sm'>
        {children}
    </ul>
  )
}


export const MenuItem = ({children}: {children: JSX.Element | string}) => {
    return <li className='border py-1 px-4 rounded-md'>{children}</li>
}
