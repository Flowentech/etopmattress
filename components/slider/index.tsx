/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'; 

import React from 'react'
import Autoplay from "embla-carousel-autoplay";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';


const BannerSlider = ({sales}: {sales:any}) => {
  return (
    <Carousel
      className="w-full max-w-screen-xl mx-auto mt-5 mb-5 "
      opts={{
        align: "start",
        loop: true,
        skipSnaps: false,
        dragFree: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
          playOnInit: true,
        }),
      ]}
    >
      <CarouselContent>
        {sales
          ?.filter((sale:any) => sale?.isActive)
          .map((sale:any) => (
            <CarouselItem key={sale?._id}>
              <Card className="overflow-hidden border-0  shadow-lg">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="flex-1 p-6 md:px-12">
                      <Badge
                        variant="secondary"
                        className="mb-2 md:mb-4 text-white capitalize"
                      >
                        {sale?.badge} {sale?.discountAmount}% off
                      </Badge>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-4">
                        {sale.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {sale?.description}
                      </p>
                      <p className="mb-4">
                        Use code:{" "}
                        <span className="font-semibold text-primary uppercase">
                          {sale.couponCode}
                        </span>{" "}
                        for{" "}
                        <span className="font-semibold">
                          {sale?.discountAmount}%
                        </span>{" "}
                        OFF
                      </p>
                      <Button className="bg-green-500">Shop Now</Button>
                    </div>

                    {sale?.image && (
                      <div className="w-full md:w-1/2 h-[400px] relative flex items-center justify-center py-2">
                        <Image
                          src={urlFor(sale?.image)?.url()}
                          alt={"bannerImage"}
                          width={800}
                          height={500}
                          priority
                          className="h-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2" />
      <CarouselNext className="absolute right-2" />
    </Carousel>
  )
}

export default BannerSlider