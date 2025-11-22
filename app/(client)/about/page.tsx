import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Etopmattress | Premium Mattresses for Better Sleep",
  description:
    "Discover the story behind Etopmattress — your trusted source for premium quality mattresses designed for the perfect night's sleep. Experience comfort, support, and value.",
  keywords: [
    "Etopmattress",
    "Premium mattresses",
    "Memory foam mattress",
    "Orthopedic mattress",
    "Spring mattress",
    "Latex mattress",
    "Hybrid mattress",
    "Sleep comfort",
    "Mattress store",
    "Best mattresses",
  ],
  openGraph: {
    title: "About Etopmattress | Premium Quality Mattresses",
    description:
      "We specialize in premium mattresses offering exceptional comfort, superior support, and unbeatable value for your perfect sleep.",
    url: "https://yourdomain.com/about",
    siteName: "Etopmattress",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Etopmattress - Premium Mattresses for Better Sleep",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


const About = () => {
  const team = [
    {
      name: "Israfil Hossain",
      role: "Founder & CEO",
      image: '/images/israfil.jpg',
      bio: "Founder of Etopmattress, passionate about delivering quality sleep solutions and exceptional customer service.",
    },
    {
      name: "Nasir Hossain",
      role: "Sleep Specialist",
      image: '/images/nasir.jpg',
      bio: "Nasir Hossain is our expert in sleep science with extensive knowledge of mattress technology and comfort.",
    },
    {
      name: "Fayz Ahmed",
      role: "Product Consultant",
      image: '/images/fayz.jpg',
      bio: "Fayz Ahmed helps customers find the perfect mattress based on their unique sleep needs and preferences.",
    },
  ];

  const values = [
    {
      title: "Quality",
      description:
        "We source only the finest materials and provide premium mattresses for lasting comfort.",
      icon: "⭐",
    },
    {
      title: "Comfort",
      description:
        "Every mattress is designed to deliver exceptional comfort and support for better sleep.",
      icon: "🛏️",
    },
    {
      title: "Innovation",
      description:
        "We stay ahead with the latest sleep technology and mattress innovations.",
      icon: "💡",
    },
    {
      title: "Customer First",
      description:
        "We build lasting relationships and ensure every customer finds their perfect mattress.",
      icon: "🤝",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-primary">Etopmattress</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We bring quality sleep into everyday life—through premium mattresses,
            exceptional comfort technology, and personalized sleep solutions for
            homes and families across the country.
          </p>
        </div>

        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Etopmattress began with a simple mission—to provide quality sleep
                for everyone. We believe every person deserves a comfortable,
                supportive mattress that promotes better health and well-being.
              </p>
              <p>
                {`Over time, we've expanded our collection to include memory foam, orthopedic, spring, latex,
                and hybrid mattresses. Whether it's for your bedroom, guest room, or children's room—we have
                the perfect mattress for every need.`}
              </p>
              <p>
                {`We're proud to offer expert guidance, quality assurance, and exceptional customer service.
                Our mission is to help you find the mattress that transforms your sleep and enhances your
                quality of life.`}
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2070&auto=format&fit=crop"
              alt="Comfortable mattress bedroom"
              width={600}
              height={400}
              priority
              className="w-full h-[400px] object-cover rounded-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-lg">
              <div className="text-2xl font-bold">5000+</div>
              <div className="text-green-100">Happy Customers</div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {`Quality sleep is more than our business—it's our passion. Here's what drives us forward:`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our passionate team of sleep experts and consultants are here to
              help you find your perfect mattress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Image src={member.image} alt={member.name} width={96} height={96} className="rounded-full w-24 h-24 object-fill" />
                    {/* <span className="text-gray-500 text-2xl">👤</span> */}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-primary text-white rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              To provide everyone with access to premium quality mattresses
              that deliver exceptional comfort, superior support, and
              transformative sleep—at prices that make sense.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">5000+</div>
                <div className="text-green-100">Mattresses Delivered</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">4.8/5</div>
                <div className="text-green-100">Customer Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">5+</div>
                <div className="text-green-100">Years of Excellence</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience Better Sleep?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {
              "Let's find your perfect mattress together. Contact us today to start your journey to better sleep."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              className="bg-primary hover:bg-green-700 text-white px-8 py-3 cursor-pointer rounded-lg"
              href="/shop"
            >
              Shop Mattresses
            </Link>
            <Link
              href="/contact"
              className="bg-primary hover:bg-green-700 text-white px-8 py-3 cursor-pointer rounded-lg"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
