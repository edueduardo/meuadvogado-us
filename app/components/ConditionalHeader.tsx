'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

const pagesWithoutHeader = ['/', '/cliente', '/advogado']

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  if (pagesWithoutHeader.includes(pathname)) {
    return null
  }
  
  return <Header />
}
