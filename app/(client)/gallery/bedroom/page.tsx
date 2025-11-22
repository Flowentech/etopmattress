import Gallery from '@/features/gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import React from 'react'

const Page = async () => {
  const galleryItems = await getAllGalleryItems();
  const bedroomItems = galleryItems.filter((item: { category: string }) => item.category === 'Bedroom');

  return (
    <Gallery galleryItems={bedroomItems} />
  )
}

export default Page