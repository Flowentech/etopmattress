import Gallery from '@/features/gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Gallery | Interiowale",
  description: "Explore our portfolio of stunning interior plant designs and outdoor spaces.",
};

const Page = async () => {
  const galleryItems = await getAllGalleryItems();

  return (
    <Gallery galleryItems={galleryItems} />
  )
}

export default Page
