import Image from "next/image";

export default function PlantCards() {

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        {/* First Card */}
        <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600">
          <div className={`absolute inset-0 bg-[url(/background1.png)] bg-cover bg-center opacity-80`}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-6">
            <div className="transform group-hover:translate-y-[-4px] transition-transform duration-300">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                Plant Guide
              </span>
              <h2 className="text-white text-xl font-bold mb-3 leading-tight">
                The Ultimate Guide to <br /> Low-Maintenance Houseplants
              </h2>
              <button className="bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 backdrop-blur-sm">
                Shop Now
              </button>
            </div>
          </div>
        </div>
  
        {/* Second Card */}
        <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600">
          <div className={`absolute inset-0 bg-[url(/bg2.jpg)] bg-cover bg-center opacity-80`}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-between p-6">
            <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-8 rounded-md overflow-hidden">
                <Image src="/bg4.jpg" alt="Plant 1" width={48} height={32} className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-8 rounded-md overflow-hidden">
                <Image src="/bg5.jpg" alt="Plant 2" width={48} height={32} className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-8 rounded-md overflow-hidden">
                <Image src="/bg-6.jpg" alt="Plant 3" width={48} height={32} className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="transform group-hover:translate-y-[-4px] transition-transform duration-300">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                Air Quality
              </span>
              <h2 className="text-white text-xl font-bold mb-3 leading-tight">
                Best Plants for Improving <br /> Air Quality in Your Home
              </h2>
              <button className="bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 backdrop-blur-sm">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  