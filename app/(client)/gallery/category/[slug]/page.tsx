import Gallery from '@/components/Gallery'
import { getAllGalleryItems } from '@/sanity/helpers'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

const validCategories = ['memory-foam', 'latex', 'hybrid', 'cooling-gel', 'orthopedic'];

const categoryMap: Record<string, string> = {
  'memory-foam': 'Memory Foam',
  'latex': 'Latex',
  'hybrid': 'Hybrid',
  'cooling-gel': 'Cooling Gel',
  'orthopedic': 'Orthopedic'
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryMap[slug];

  if (!category) {
    return {
      title: 'Category Not Found | Etopmattress',
    };
  }

  return {
    title: `${category} Mattresses | Etopmattress`,
    description: `Explore our collection of ${category} mattresses for ultimate comfort and support.`,
  };
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  if (!validCategories.includes(slug)) {
    notFound();
  }

  const category = categoryMap[slug];
  const allItems = await getAllGalleryItems();
  const filteredItems = allItems.filter(item => item.category === category);

  return (
    <Gallery galleryItems={filteredItems} categoryFilter={category} />
  )
}

export default Page
