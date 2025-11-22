
import { SALE_QUERYResult } from "@/sanity.types";
import React from "react";
import BannerSlider from "./slider";

export const DiscountBanner = async ({ sales }: { sales: SALE_QUERYResult }) => {
  return (
   <BannerSlider sales={sales} />
  );
};


