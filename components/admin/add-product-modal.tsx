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

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navigationCategories, setNavigationCategories] = useState<Category[]>([]);
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
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadNavigationCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      // The categories API returns array with { _id, title, slug }
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
      // Fetch navigation categories from Sanity
      const response = await fetch('/api/categories?type=navigationcategory');
      if (!response.ok) {
        console.log('Navigation categories endpoint not available');
        return; // Navigation categories are optional
      }

      const result = await response.json();
      // Map the navigation categories to match expected format
      const mappedNavCategories = Array.isArray(result) ? result.map((cat: any) => ({
        _id: cat._id,
        name: cat.title,
        slug: cat.slug
      })) : [];
      setNavigationCategories(mappedNavCategories);
    } catch (error) {
      console.error('Error loading navigation categories:', error);
      // Don't show error toast - navigation categories are optional
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

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Product created successfully');
        onSuccess();
        handleClose();
      } else {
        toast.error(result.error?.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
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
    });
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product organized by categories
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
