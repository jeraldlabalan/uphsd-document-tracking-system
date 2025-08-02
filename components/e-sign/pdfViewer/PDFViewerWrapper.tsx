'use client'

import dynamic from 'next/dynamic'


// Load PDFViewer only on the client side
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
})

export default PDFViewer
