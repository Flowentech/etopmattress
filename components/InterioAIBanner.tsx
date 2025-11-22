"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

export default function InterioAIBanner() {
  const { user } = useUser();

  const bannerContent = (
    <div className="relative bg-emerald-50 border border-emerald-100 rounded-xl p-8 lg:p-12 my-8 group cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-24 h-24 rounded-lg overflow-hidden">
          <Image src="/background1.png" alt="Interior" fill className="object-cover" />
        </div>
        <div className="absolute bottom-4 left-4 w-20 h-20 rounded-lg overflow-hidden">
          <Image src="/bg2.jpg" alt="Landscaping" fill className="object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-6 lg:mb-0 lg:flex-1">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-2 rounded-lg mb-4">
              <Image
                src="/images/Interio_AI.gif"
                alt="Interio AI"
                width={20}
                height={20}
                className="w-5 h-5 mr-2 object-contain"
                unoptimized
              />
              Interio AI
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Decor your home with our <br />
              <span className="text-emerald-600">Interio AI</span>
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl mb-6 max-w-2xl">
              Transform any room instantly with AI-powered interior design. Upload your space and get personalized recommendations with shoppable products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <div className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-md">
                {user ? "Start Designing →" : "Sign In & Start Designing →"}
              </div>
              {user && (
                <div className="text-gray-600 text-sm">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium mr-2">
                    FREE
                  </span>
                  3 AI Credits Available
                </div>
              )}
            </div>
          </div>

          {/* Home & Landscaping Pictures */}
          <div className="relative lg:flex-shrink-0">
            <div className="grid grid-cols-2 gap-3 w-64 h-48 lg:w-72 lg:h-56">
              {/* Living Room */}
              <div className="relative rounded-xl overflow-hidden shadow-md border border-emerald-100">
                <Image src="/background1.png" alt="Interior Design" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium">Living Room</p>
                </div>
              </div>

              {/* Garden/Landscaping */}
              <div className="relative rounded-xl overflow-hidden shadow-md border border-emerald-100">
                <Image src="/bg2.jpg" alt="Landscaping" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium">Landscaping</p>
                </div>
              </div>

              {/* Bedroom */}
              <div className="relative rounded-xl overflow-hidden shadow-md border border-emerald-100">
                <Image src="/bg4.jpg" alt="Bedroom Design" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium">Bedroom</p>
                </div>
              </div>

              {/* Kitchen */}
              <div className="relative rounded-xl overflow-hidden shadow-md border border-emerald-100">
                <Image src="/bg5.jpg" alt="Kitchen Design" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium">Kitchen</p>
                </div>
              </div>
            </div>

            {/* AI Bot Badge */}
            <div className="absolute -bottom-3 -right-3 bg-emerald-600 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center">
              <Image
                src="/images/Interio_AI.gif"
                alt="AI"
                width={16}
                height={16}
                className="w-4 h-4 mr-1 object-contain"
                unoptimized
              />
              AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {user ? (
        <Link href="/ai" className="block">
          {bannerContent}
        </Link>
      ) : (
        <SignInButton mode="modal">
          <div>
            {bannerContent}
          </div>
        </SignInButton>
      )}
    </div>
  );
}