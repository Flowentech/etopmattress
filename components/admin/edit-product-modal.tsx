'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: { current: string };
}

interface Size {
  _id: string;
  name: string;
}

interface Height {
  _id: string;
  name: string;
}

interface PriceVariant {
  size: string;
  height: string;
  price: string;
  stock: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  status: string;
  label?: string;
  isApproved: boolean;
  categories: Array<{ _id: string; title: string }>;
  navigationcategory?: Array<{ _id: string; title: string }>;
  hasVariants?: boolean;
  priceVariants?: Array<{
    size: { _id: string; name?: string };
    height: { _id: string; name?: string };
    price: number;
    stock: number;
  }>;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navigationCategories, setNavigationCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [heights, setHeights] = useState<Height[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    stock: '',
    status: 'new',
    label: '',
    isApproved: true,
    categories: [] as string[],
    navigationCategories: [] as string[],
    hasVariants: false,
    priceVariants: [] as PriceVariant[],
  });

  useEffect(() => {
    if (isOpen && product) {
      loadCategories();
      loadNavigationCategories();
      loadSizes();
      loadHeights();

      // Populate form with product data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        discount: product.discount?.toString() || '0',
        stock: product.stock?.toString() || '',
        status: product.status || 'new',
        label: product.label || '',
        isApproved: product.isApproved ?? true,
        categories: product.categories?.map(c => c._id) || [],
        navigationCategories: product.navigationcategory?.map(c => c._id) || [],
        hasVariants: product.hasVariants || false,
        priceVariants: product.priceVariants?.map(v => ({
          size: v.size._id,
          height: v.height._id,
          price: v.price.toString(),
          stock: v.stock.toString()
        })) || [],
      });
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      const mappedCategories = Array.isArray(result) ? result.map((cat: any) => ({
        _id: cat._id,
        name: cat.title,
        slug: cat.slug
      })) : [];
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadNavigationCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=navigationcategory');
      if (!response.ok) {
        console.log('Navigation categories endpoint not available');
        return;
      }

      const result = await response.json();
      const mappedNavCategories = Array.isArray(result) ? result.map((cat: any) => ({
        _id: cat._id,
        name: cat.title,
        slug: cat.slug
      })) : [];
      setNavigationCategories(mappedNavCategories);
    } catch (error) {
      console.error('Error loading navigation categories:', error);
    }
  };

  const loadSizes = async () => {
    try {
      const response = await fetch('/api/admin/sizes');
      if (!response.ok) throw new Error('Failed to fetch sizes');
      const result = await response.json();
      setSizes(result.sizes || []);
    } catch (error) {
      console.error('Error loading sizes:', error);
      toast.error('Failed to load sizes');
    }
  };

  const loadHeights = async () => {
    try {
      const response = await fetch('/api/admin/heights');
      if (!response.ok) throw new Error('Failed to fetch heights');
      const result = await response.json();
      setHeights(result.heights || []);
    } catch (error) {
      console.error('Error loading heights:', error);
      toast.error('Failed to load heights');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields (Name and Price)');
      return;
    }

    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (!product?._id) {
      toast.error('Product ID is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/products?id=${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Product updated successfully');
        onSuccess();
        handleClose();
      } else {
        toast.error(result.error?.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '0',
      stock: '',
      status: 'new',
      label: '',
      isApproved: true,
      categories: [],
      navigationCategories: [],
      hasVariants: false,
      priceVariants: [],
    });
    onClose();
  };

  const addPriceVariant = () => {
    setFormData((prev) => ({
      ...prev,
      priceVariants: [...prev.priceVariants, { size: '', height: '', price: '', stock: '' }],
    }));
  };

  const removePriceVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      priceVariants: prev.priceVariants.filter((_, i) => i !== index),
    }));
  };

  const updatePriceVariant = (index: number, field: keyof PriceVariant, value: string) => {
    setFormData((prev) => ({
      ...prev,
      priceVariants: prev.priceVariants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleNavCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      navigationCategories: prev.navigationCategories.includes(categoryId)
        ? prev.navigationCategories.filter((id) => id !== categoryId)
        : [...prev.navigationCategories, categoryId],
    }));
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information and categories
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label (Optional)</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Best Seller, Limited Edition"
              />
            </div>

            {/* Approval Status */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isApproved"
                  checked={formData.isApproved}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isApproved: checked as boolean })
                  }
                />
                <label
                  htmlFor="isApproved"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Approved
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>
              Categories <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500">Select at least one category for this product</p>
            <ScrollArea className="h-40 border rounded-md p-3">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No categories available. Please create categories first.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category._id}`}
                        checked={formData.categories.includes(category._id)}
                        onCheckedChange={() => handleCategoryToggle(category._id)}
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {formData.categories.length > 0 && (
              <p className="text-xs text-green-600">
                {formData.categories.length} {formData.categories.length === 1 ? 'category' : 'categories'} selected
              </p>
            )}
          </div>

          {/* Navigation Categories (Optional) */}
          {navigationCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Section Categories (Optional)</Label>
              <p className="text-xs text-gray-500">Select section categories for navigation organization (optional)</p>
              <ScrollArea className="h-32 border rounded-md p-3">
                <div className="space-y-2">
                  {navigationCategories.map((category) => (
                    <div key={category._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`nav-category-${category._id}`}
                        checked={formData.navigationCategories.includes(category._id)}
                        onCheckedChange={() => handleNavCategoryToggle(category._id)}
                      />
                      <label
                        htmlFor={`nav-category-${category._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {formData.navigationCategories.length > 0 && (
                <p className="text-xs text-blue-600">
                  {formData.navigationCategories.length} section {formData.navigationCategories.length === 1 ? 'category' : 'categories'} selected
                </p>
              )}
            </div>
          )}

          {/* Size & Height Variants */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasVariants"
                checked={formData.hasVariants}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, hasVariants: checked as boolean, priceVariants: checked ? formData.priceVariants : [] })
                }
              />
              <label
                htmlFor="hasVariants"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Enable Size & Height Variants
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Check this if product price depends on size and height combinations
            </p>

            {formData.hasVariants && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Price Variants</Label>
                  <Button type="button" size="sm" onClick={addPriceVariant}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Variant
                  </Button>
                </div>

                {formData.priceVariants.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 border rounded-md">
                    No variants added yet. Click "Add Variant" to create size/height combinations.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.priceVariants.map((variant, index) => (
                      <div key={index} className="border rounded-md p-3 space-y-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Variant {index + 1}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removePriceVariant(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`variant-size-${index}`} className="text-xs">Size</Label>
                            <Select
                              value={variant.size}
                              onValueChange={(value) => updatePriceVariant(index, 'size', value)}
                            >
                              <SelectTrigger id={`variant-size-${index}`}>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {sizes.map((size) => (
                                  <SelectItem key={size._id} value={size._id}>
                                    {size.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`variant-height-${index}`} className="text-xs">Height</Label>
                            <Select
                              value={variant.height}
                              onValueChange={(value) => updatePriceVariant(index, 'height', value)}
                            >
                              <SelectTrigger id={`variant-height-${index}`}>
                                <SelectValue placeholder="Select height" />
                              </SelectTrigger>
                              <SelectContent>
                                {heights.map((height) => (
                                  <SelectItem key={height._id} value={height._id}>
                                    {height.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`variant-price-${index}`} className="text-xs">Price</Label>
                            <Input
                              id={`variant-price-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.price}
                              onChange={(e) => updatePriceVariant(index, 'price', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`variant-stock-${index}`} className="text-xs">Stock</Label>
                            <Input
                              id={`variant-stock-${index}`}
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => updatePriceVariant(index, 'stock', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
