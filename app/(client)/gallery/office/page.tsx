import Gallery from '@/features/gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import React from 'react'

const Page = async () => {
  const galleryItems = await getAllGalleryItems();
  const officeItems = galleryItems.filter((item: { category: string }) => item.category === 'Office');

  return (
    <Gallery galleryItems={officeItems} />
  )
}

export default Page