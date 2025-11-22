import Gallery from '@/features/gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import React from 'react'

const Page = async () => {
  const galleryItems = await getAllGalleryItems();
  const kitchenItems = galleryItems.filter((item: { category: string }) => item.category === 'Kitchen');

  return (
    <Gallery galleryItems={kitchenItems} />
  )
}

export default Page