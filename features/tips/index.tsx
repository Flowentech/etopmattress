'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import Link from 'next/link';

interface Blog {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage: any;
  publishedAt: string;
  author: { name: string };
  categories: { title: string }[];
  isFeatured: boolean;
}

interface TipsProps {
  blogs: Blog[];
  initialCategory?: string;
}

const Tips = ({ blogs, initialCategory }: TipsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Extract unique categories from blogs
  const categories = ['All', ...Array.from(new Set(
    blogs.flatMap(blog => blog.categories?.map(cat => cat.title) || [])
  ))];

  const filteredPosts = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           blog.categories?.some(cat => cat.title === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (excerpt: string) => {
    const words = excerpt.split(' ').length;
    const readTime = Math.ceil(words / 200);
    return `${readTime} min read`;
  };

  return (
    <div className="min-h-screen bg-white">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sleep & Mattress <span className="text-primary">Tips and Guides</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Expert advice, buying guides, and sleep tips to help you find the perfect mattress
            and improve your sleep quality for better health and wellness.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-center"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
            const isAll = category === 'All';

            return isAll ? (
              <Link key={category} href="/blog">
                <Button
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`${
                    selectedCategory === category
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  {category}
                </Button>
              </Link>
            ) : (
              <Link key={category} href={`/blog/category/${categorySlug}`}>
                <Button
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`${
                    selectedCategory === category
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  {category}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <Card className="mb-16 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {filteredPosts[0].coverImage && (
                  <Image
                    width={500} 
                    height={200}
                    src={urlFor(filteredPosts[0].coverImage).url()}
                    alt={filteredPosts[0].title}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                )}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    {filteredPosts[0].categories?.[0] && (
                      <span className="ml-3 text-primary text-sm font-medium">
                        {filteredPosts[0].categories[0].title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span>By {filteredPosts[0].author?.name || 'Anonymous'}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(filteredPosts[0].publishedAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{getReadTime(filteredPosts[0].excerpt)}</span>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Link href={`/blog/${filteredPosts[0].slug.current}`}>
                        Read More
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.slice(1).map((blog) => (
            <Card key={blog._id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  {blog.coverImage && (
                    <Image
                      width={500} 
                      height={200}
                      src={urlFor(blog.coverImage).url()}
                      alt={blog.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {blog.categories?.[0] && (
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {blog.categories[0].title}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>By {blog.author?.name || 'Anonymous'}</span>
                    <span>{getReadTime(blog.excerpt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{formatDate(blog.publishedAt)}</span>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                      <Link href={`/blog/${blog.slug.current}`}>
                        Read More
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <section className="bg-primary text-white rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Subscribe to get the latest sleep tips, mattress buying guides, and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white text-gray-900"
              />
              <Button className="bg-white text-primary hover:bg-gray-100 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Topics</h2>
            <p className="text-gray-600">Explore our most popular sleep and mattress topics</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { topic: 'Buying Guides', count: '12 Articles', icon: '🛏️' },
              { topic: 'Sleep Tips', count: '8 Articles', icon: '😴' },
              { topic: 'Mattress Care', count: '6 Articles', icon: '✨' },
              { topic: 'Health & Wellness', count: '10 Articles', icon: '💪' }
            ].map((item, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.topic}</h3>
                  <p className="text-sm text-gray-500">{item.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Tips;
