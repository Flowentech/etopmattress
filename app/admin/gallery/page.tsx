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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Star,
  MoreVertical,
  AlertCircle,
  Grid3x3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GalleryItem {
  _id: string;
  title: string;
  slug: string;
  category: 'Living Room' | 'Office' | 'Bedroom' | 'Kitchen' | 'Outdoor';
  image?: string;
  description: string;
  detailedDescription?: any[];
  gallery?: string[];
  features?: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GalleryResponse {
  gallery: GalleryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const categoryColors: Record<string, string> = {
  'Living Room': 'bg-blue-100 text-blue-800 border-blue-200',
  'Office': 'bg-gray-100 text-gray-800 border-gray-200',
  'Bedroom': 'bg-purple-100 text-purple-800 border-purple-200',
  'Kitchen': 'bg-green-100 text-green-800 border-green-200',
  'Outdoor': 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState<GalleryResponse['pagination'] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Living Room' as GalleryItem['category'],
    image: '',
    description: '',
    features: '',
    isFeatured: false
  });

  useEffect(() => {
    loadGallery();
  }, [categoryFilter, featuredFilter, searchTerm]);

  const loadGallery = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/gallery?${params}`);

      if (!response.ok) {
        const result = await response.json();
        const errorMessage = result.error?.message || result.error || `HTTP error ${response.status}`;
        setError(errorMessage);
        setGallery([]);
        setPagination(null);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setGallery(result.data.gallery || []);
        setPagination(result.data.pagination || {
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false
        });
      } else {
        const errorMessage = result.error?.message || result.error || 'Unknown API error';
        setError(errorMessage);
        setGallery([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load gallery items';
      setError(errorMessage);
      setGallery([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      title: '',
      slug: '',
      category: 'Living Room',
      image: '',
      description: '',
      features: '',
      isFeatured: false
    });
    setAddDialogOpen(true);
  };

  const handleCreateItem = async () => {
    if (!formData.title || !formData.slug || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _type: 'gallery',
          title: formData.title,
          slug: { _type: 'slug', current: formData.slug },
          category: formData.category,
          image: formData.image || undefined,
          description: formData.description,
          features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
          isFeatured: formData.isFeatured
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Gallery item created successfully');
        loadGallery();
        setAddDialogOpen(false);
      } else {
        const errorMessage = result.error?.message || result.error || 'Failed to create gallery item';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create gallery item';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditItem = (item: GalleryItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (item: GalleryItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/gallery/${selectedItem._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Gallery item deleted successfully');
        loadGallery();
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      } else {
        const errorMessage = result.error?.message || 'Failed to delete gallery item';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete gallery item';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async (item: GalleryItem) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/gallery/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isFeatured: !item.isFeatured
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Gallery item ${item.isFeatured ? 'removed from' : 'added to'} featured`);
        loadGallery();
      } else {
        const errorMessage = result.error?.message || 'Failed to update gallery item';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update gallery item';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gallery Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Gallery Items</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadGallery}>Try Again</Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
          <p className="text-gray-600">Manage gallery items and showcase projects</p>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gallery Item
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{pagination?.total || 0}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {gallery.filter(item => item.isFeatured).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(gallery.map(item => item.category)).size}
                </p>
              </div>
              <Grid3x3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Gallery</p>
                <p className="text-2xl font-bold text-green-600">
                  {gallery.filter(item => item.gallery && item.gallery.length > 0).length}
                </p>
              </div>
              <ImageIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search gallery items by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Living Room">Living Room</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Bedroom">Bedroom</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="true">Featured Only</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Items ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {gallery.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gallery.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{item.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(item.category)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>1 main</span>
                            {item.gallery && item.gallery.length > 0 && (
                              <span>+{item.gallery.length} more</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {item.features?.length || 0} features
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isFeatured ? "default" : "secondary"}
                          className={item.isFeatured ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                        >
                          {item.isFeatured ? 'Featured' : 'Regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => toggleFeatured(item)}>
                                <Star className="h-4 w-4 mr-2" />
                                {item.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteItem(item)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Gallery Items Yet</h3>
              <p className="text-gray-600 mb-4">There are no gallery items in the system yet.</p>
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Gallery Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Gallery Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Gallery Item</DialogTitle>
            <DialogDescription>
              Create a new gallery item to showcase your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter gallery item title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                placeholder="enter-slug-here"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as GalleryItem['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Living Room">Living Room</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Bedroom">Bedroom</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL (optional)</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Input
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Features (comma-separated)</label>
              <Input
                placeholder="Feature 1, Feature 2, Feature 3"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium">
                Mark as Featured
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateItem}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Gallery Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gallery Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
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
              {isDeleting ? 'Deleting...' : 'Delete Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}