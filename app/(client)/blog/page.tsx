import Tips from '@/features/tips'
import { getAllBlogs } from '@/sanity/helpers'
import React from 'react'

const Page = async () => {
  const blogs = await getAllBlogs()
  
  return (
    <Tips blogs={blogs} />
  )
}

export default Page
