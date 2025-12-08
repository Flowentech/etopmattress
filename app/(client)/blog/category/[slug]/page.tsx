import Tips from '@/features/tips'
import { getAllBlogs } from '@/sanity/helpers'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${categoryTitle} Articles | Etopmattress Blog`,
    description: `Read our latest articles about ${categoryTitle} and sleep tips.`,
  };
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const categoryTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const allBlogs = await getAllBlogs();
  const filteredBlogs = allBlogs.filter(blog =>
    blog.categories?.some(cat => cat.title.toLowerCase().replace(/\s+/g, '-') === slug)
  );

  if (filteredBlogs.length === 0 && allBlogs.length > 0) {
    // Category exists but has no blogs, show all blogs instead
    return <Tips blogs={allBlogs} initialCategory={categoryTitle} />
  }

  return (
    <Tips blogs={filteredBlogs.length > 0 ? filteredBlogs : allBlogs} initialCategory={categoryTitle} />
  )
}

export default Page
