'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BlogCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  color?: string;
  _createdAt: string;
  _updatedAt: string;
}

const colorOptions = [
  { value: 'green', label: 'Green', className: 'bg-green-100 text-green-800' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-100 text-blue-800' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-100 text-purple-800' },
  { value: 'orange', label: 'Orange', className: 'bg-orange-100 text-orange-800' },
  { value: 'red', label: 'Red', className: 'bg-red-100 text-red-800' },
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-100 text-yellow-800' },
];

export default function BlogCategoriesManagement() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    color: 'blue'
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    slug: '',
    description: '',
    color: 'blue'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/admin/blog-categories');

      if (!response.ok) {
        const result = await response.json();
        const errorMessage = result.error?.message || result.error || `HTTP error ${response.status}`;
        setError(errorMessage);
        setCategories([]);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCategories(result.data.categories || []);
      } else {
        const errorMessage = result.error?.message || result.error || 'Unknown API error';
        setError(errorMessage);
        setCategories([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load categories';
      setError(errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      color: 'blue'
    });
    setAddDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!formData.title || !formData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/admin/blog-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _type: 'blogCategory',
          title: formData.title,
          slug: { _type: 'slug', current: formData.slug },
          description: formData.description,
          color: formData.color
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Category created successfully');
        loadCategories();
        setAddDialogOpen(false);
      } else {
        const errorMessage = result.error?.message || result.error || 'Failed to create category';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create category';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCategory = (category: BlogCategory) => {
    setSelectedCategory(category);
    setEditFormData({
      title: category.title,
      slug: category.slug.current,
      description: category.description || '',
      color: category.color || 'blue'
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !editFormData.title || !editFormData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/blog-categories/${selectedCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _type: 'blogCategory',
          title: editFormData.title,
          slug: { _type: 'slug', current: editFormData.slug },
          description: editFormData.description,
          color: editFormData.color
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Category updated successfully');
        loadCategories();
        setEditDialogOpen(false);
        setSelectedCategory(null);
      } else {
        const errorMessage = result.error?.message || result.error || 'Failed to update category';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update category';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = (category: BlogCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/blog-categories/${selectedCategory._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Category deleted successfully');
        loadCategories();
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        const errorMessage = result.error?.message || 'Failed to delete category';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete category';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color);
    return colorOption?.className || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Blog Categories</h2>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Blog Categories</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Categories</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadCategories}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Categories</h2>
          <p className="text-gray-600">Manage blog categories for organizing content</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <p className="font-medium">{category.title}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.slug.current}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description || 'No description'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getColorClass(category.color || 'blue')}>
                          {category.color || 'blue'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Yet</h3>
              <p className="text-gray-600 mb-4">Create your first blog category.</p>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new blog category for organizing content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g., Sleep Tips"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                placeholder="e.g., sleep-tips"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description of the category"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.className}`}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g., Sleep Tips"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                placeholder="e.g., sleep-tips"
                value={editFormData.slug}
                onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description of the category"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Select value={editFormData.color} onValueChange={(value) => setEditFormData({ ...editFormData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.className}`}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
