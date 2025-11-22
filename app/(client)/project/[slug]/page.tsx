import { notFound } from 'next/navigation';
import { getLandscapingProjectBySlug } from '@/sanity/helpers';
import Container from '@/components/Container';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getLandscapingProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <Badge className="mb-4">{project.category}</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
          <p className="text-xl text-gray-600">{project.description}</p>
        </div>

        {/* Project Image */}
        {project.image && (
          <div className="mb-8">
            <Image
              src={urlFor(project.image).url()}
              alt={project.title}
              width={800}
              height={500}
              className="w-full h-[400px] object-cover rounded-lg"
            />
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Detailed Description */}
            {project.detailedDescription && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Project Details</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{project.detailedDescription}</p>
                </div>
              </div>
            )}

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.gallery.map((image: any, index: number) => (
                    <Image
                      key={index}
                      src={urlFor(image).url()}
                      alt={`${project.title} gallery ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Project Info</h3>
              
              {project.price && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Starting Price</span>
                  <p className="text-2xl font-bold text-green-600">${project.price.toLocaleString()}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Category</span>
                  <p className="font-medium">{project.category}</p>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                Get Quote
              </Button>
              
              <Button variant="outline" className="w-full mt-3">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}