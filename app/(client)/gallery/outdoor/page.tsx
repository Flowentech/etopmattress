import Gallery from '@/features/gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import React from 'react'

const Page = async () => {
  const galleryItems = await getAllGalleryItems();
  const outdoorItems = galleryItems.filter((item: { category: string }) => item.category === 'Outdoor');

  return (
    <Gallery galleryItems={outdoorItems} />
  )
}

export default Page