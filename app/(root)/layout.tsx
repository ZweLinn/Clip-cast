import React from 'react'
import NavBar from '@/components/layout/nav-bar'
const layout = ({children} : {children: React.ReactNode}) => {
  return (
    <div> 
        <NavBar/>
        <div>{children}</div>
    </div>
  )
}

export default layout