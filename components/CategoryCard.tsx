import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
interface Category {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
  };
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const categoryUrl = `/shop?category=${category._id}`;

  return (
    <Link href={categoryUrl}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200 w-36 h-36">
        {/* Category Image */}
        <div className="w-full h-24 overflow-hidden bg-gray-100">
          {category.image ? (
            <Image
              src={urlFor(category.image).url()}
              alt={category.title}
              width={144}
              height={96}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
              <div className="text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Category Content */}
        <div className="p-3 h-12 flex items-center justify-center">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors text-center truncate">
            {category.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;