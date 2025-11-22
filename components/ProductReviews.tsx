"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Star, ThumbsUp } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Image from "next/image";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: Array<{
    asset: {
      url: string;
    };
    alt?: string;
  }>;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  reviews,
  averageRating,
  totalReviews,
}) => {
  const { user } = useUser();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }

    if (newReview.comment.length < 10) {
      toast.error("Review comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", newReview.rating.toString());
      formData.append("title", newReview.title);
      formData.append("comment", newReview.comment);
      
      newReview.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch("/api/reviews/create", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review submitted successfully! It will be published after moderation.");
        setNewReview({ rating: 5, title: "", comment: "", images: [] });
        setShowReviewForm(false);
        // Refresh reviews
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + newReview.images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            {user && (
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                variant="outline"
              >
                Write a Review
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            {renderStars(Math.round(averageRating))}
            <div className="text-gray-500">({totalReviews} reviews)</div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(newReview.rating, true, (rating) =>
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Review Title</label>
                <Input
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your thoughts about this product..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full"
                  />
                  {newReview.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {newReview.images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.userName}</span>
                    {review.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image.asset.url}
                      alt={image.alt || `Review image ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded border object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-gray-700">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;