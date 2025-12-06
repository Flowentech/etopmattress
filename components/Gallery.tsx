/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

interface GalleryItem {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  image: any;
  description: string;
  features?: string[];
  isFeatured?: boolean;
}

interface GalleryProps {
  galleryItems: GalleryItem[];
}

const Gallery = ({ galleryItems }: GalleryProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Memory Foam', 'Latex', 'Hybrid', 'Cooling Gel', 'Orthopedic'];

  const filteredItems = selectedCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  const handleImageClick = (item: GalleryItem) => {
    setSelectedImage(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mattress <span className="text-primary">Collection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our premium mattress collection designed for ultimate comfort and support.
            Discover the perfect mattress for your sleep style and preferences.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? 'bg-primary hover:bg-primary/80 text-white'
                  : 'border-white text-primary '
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredItems.filter(item => {
            try {
              return item.image && item.image.asset && urlFor(item.image).url();
            } catch {
              return false;
            }
          }).map((item) => {
            let imageUrl;
            try {
              imageUrl = urlFor(item.image).url();
              if (!imageUrl) return null;
            } catch {
              return null;
            }
            return (
            <Card key={item._id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
              <CardContent className="p-0" onClick={() => handleImageClick(item)}>
                <div className="relative overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button className="bg-white text-gray-900 hover:bg-gray-100">
                      View Details
                    </Button>
                  </div>
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </div>
                  {item.isFeatured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  {item.features && item.features.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {item.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <section className="bg-blue-600 text-white rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Choose Etopmattress</h2>
            <p className="text-blue-100">Premium comfort and quality sleep solutions</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10k+', label: 'Happy Customers' },
              { number: '50+', label: 'Mattress Models' },
              { number: '99%', label: 'Satisfaction Rate' },
              { number: '10yr', label: 'Warranty' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Mattress Today
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Experience the difference quality sleep can make. Our expert team is ready to help you find the ideal mattress for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Shop Now
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
              Get Consultation
            </Button>
          </div>
        </section>
      </main>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0">
          {selectedImage && (
            <div className="h-full max-h-[90vh] overflow-y-auto">
              <DialogHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 pr-8">
                  {selectedImage.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-6 space-y-6">
                {selectedImage.image && (() => {
                  try {
                    const imageUrl = urlFor(selectedImage.image).url();
                    return (
                      <div className="relative">
                        <Image
                          width={800}
                          height={500}
                          src={imageUrl}
                          alt={selectedImage.title}
                          className="w-full h-64 md:h-80 object-cover rounded-lg"
                          priority
                        />
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    {selectedImage.category}
                  </span>
                  {selectedImage.isFeatured && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
                      Featured Product
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedImage.description}
                  </p>
                </div>
                
                {selectedImage.features && selectedImage.features.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {selectedImage.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
