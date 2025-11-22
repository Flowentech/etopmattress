import Gallery from '@/features/gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import React from 'react'

const Page = async () => {
  const galleryItems = await getAllGalleryItems();
  const livingRoomItems = galleryItems.filter((item: { category: string }) => item.category === 'Living Room');

  return (
    <Gallery galleryItems={livingRoomItems} />
  )
}

export default Page