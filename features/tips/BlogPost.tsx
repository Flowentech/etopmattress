'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content: any;
  coverImage: any;
  publishedAt: string;
  author: { name: string; image?: any };
  categories: { title: string }[];
  isFeatured: boolean;
}

interface BlogPostProps {
  blog: BlogPost;
}

const BlogPost = ({ blog }: BlogPostProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content: any) => {
    // Estimate read time based on content
    const words = JSON.stringify(content).split(' ').length;
    const readTime = Math.ceil(words / 200);
    return `${readTime} min read`;
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="outline" className="mb-8 flex items-center gap-2 border-primary text-primary hover:bg-primary/5">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories?.map((category, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  {category.title}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By {blog.author?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{getReadTime(blog.content)}</span>
              </div>
            </div>

            {/* Cover Image */}
            {blog.coverImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <Image
                  src={urlFor(blog.coverImage).url()}
                  alt={blog.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {blog.excerpt}
            </p>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <PortableText value={blog.content} />
          </div>
        </article>

        {/* Author Card */}
        {blog.author && (
          <Card className="mt-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {blog.author.image && (
                  <Image
                    src={urlFor(blog.author.image).url()}
                    alt={blog.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {blog.author.name}
                  </h3>
                  <p className="text-gray-600">Sleep & Mattress Expert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Blog */}
        <div className="text-center mt-12">
          <Link href="/blog">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Explore More Articles
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;