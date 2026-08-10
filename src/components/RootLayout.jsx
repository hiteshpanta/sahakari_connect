import React from 'react'
import { Outlet } from 'react-router-dom'
// import MainLayout from './layout/MainLayout'
import Header from './Header'

export default function RootLayout() {
  // return <Outlet />

  return(
    <div>
      <Header />
        {/* <MainLayout> */}
        <main>
          <Outlet />
        </main>
            
        {/* </MainLayout> */}
      
    </div>
  )
}
