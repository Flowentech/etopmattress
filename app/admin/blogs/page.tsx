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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Star,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  author?: {
    _id: string;
    name: string;
    slug: string;
  };
  categories?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogsResponse {
  blogs: Blog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt?: string;
  author?: string;
  categories?: string[];
  isFeatured: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
}

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pagination, setPagination] = useState<BlogsResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state for add/edit
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    coverImage: '',
    publishedAt: new Date().toISOString(),
    author: '',
    categories: [],
    isFeatured: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: []
    }
  });

  useEffect(() => {
    loadBlogs();
  }, [categoryFilter, featuredFilter, searchTerm, currentPage, pageSize]);

  const loadBlogs = async () => {
    try {
      setError(null);
      setLoading(true);

      const offset = (currentPage - 1) * pageSize;
      const params = new URLSearchParams();
      params.append('limit', pageSize.toString());
      params.append('offset', offset.toString());
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/blogs?${params}`);

      if (!response.ok) {
        const result = await response.json();
        const errorMessage = result.error?.message || result.error || `HTTP error ${response.status}`;
        setError(errorMessage);
        setBlogs([]);
        setPagination(null);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setBlogs(result.data.blogs || []);
        setPagination(result.data.pagination || {
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false
        });
      } else {
        const errorMessage = result.error?.message || result.error || 'Unknown API error';
        setError(errorMessage);
        setBlogs([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load blogs';
      setError(errorMessage);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = () => {
    setSelectedBlog(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      coverImage: '',
      publishedAt: new Date().toISOString(),
      author: '',
      categories: [],
      isFeatured: false,
      seo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: []
      }
    });
    setEditDialogOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage || '',
      publishedAt: blog.publishedAt || new Date().toISOString(),
      author: blog.author?._id || '',
      categories: blog.categories?.map(cat => cat._id) || [],
      isFeatured: blog.isFeatured,
      seo: blog.seo || {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: []
      }
    });
    setEditDialogOpen(true);
  };

  const handleSaveBlog = async () => {
    try {
      setIsSaving(true);

      const url = selectedBlog
        ? `/api/admin/blogs/${selectedBlog._id}`
        : '/api/admin/blogs';

      const method = selectedBlog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Blog ${selectedBlog ? 'updated' : 'created'} successfully`);
        loadBlogs();
        setEditDialogOpen(false);
        setSelectedBlog(null);
      } else {
        const errorMessage = result.error?.message || `Failed to ${selectedBlog ? 'update' : 'create'} blog`;
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || `Failed to ${selectedBlog ? 'update' : 'create'} blog`;
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    if (!selectedBlog) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const handleDeleteBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBlog) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/blogs/${selectedBlog._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Blog deleted successfully');
        loadBlogs();
        setDeleteDialogOpen(false);
        setSelectedBlog(null);
      } else {
        const errorMessage = result.error?.message || 'Failed to delete blog';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete blog';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async (blog: Blog) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/blogs/${blog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blog,
          isFeatured: !blog.isFeatured
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Blog ${blog.isFeatured ? 'removed from' : 'added to'} featured`);
        loadBlogs();
      } else {
        const errorMessage = result.error?.message || 'Failed to update blog';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update blog';
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Blogs Management</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Blogs Management</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Blogs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadBlogs}>Try Again</Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Blogs Management</h2>
          <p className="text-gray-600">Manage blog posts and content</p>
        </div>
        <Button onClick={handleAddBlog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Blog
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Blogs</p>
                <p className="text-2xl font-bold">{pagination?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {blogs.filter(blog => blog.isFeatured).length}
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
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {blogs.filter(blog => blog.publishedAt).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Authors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(blogs.map(blog => blog.author?.name).filter(Boolean)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search blogs by title or excerpt..."
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
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="true">Featured Only</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blogs ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {blogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blog</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {blog.coverImage && (
                            <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                              <img
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{blog.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{blog.excerpt}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {blog.author ? (
                          <div>
                            <p className="font-medium">{blog.author.name}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No author</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {blog.categories?.map((category) => (
                            <Badge key={category._id} variant="secondary" className="text-xs">
                              {category.title}
                            </Badge>
                          )) || <span className="text-gray-400">No categories</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {blog.publishedAt ? (
                          <div className="text-sm">
                            <p>{formatDate(blog.publishedAt)}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={blog.isFeatured ? "default" : "secondary"}
                          className={blog.isFeatured ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                        >
                          {blog.isFeatured ? 'Featured' : 'Regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(blog.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBlog(blog)}
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
                              <DropdownMenuItem onClick={() => toggleFeatured(blog)}>
                                <Star className="h-4 w-4 mr-2" />
                                {blog.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBlog(blog)}
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
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blogs Yet</h3>
              <p className="text-gray-600 mb-4">There are no blog posts in the system yet.</p>
              <Button onClick={handleAddBlog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Blog
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} blogs
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(pagination.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(pagination.total / pageSize), prev + 1))}
                  disabled={currentPage >= Math.ceil(pagination.total / pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Blog Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBlog ? 'Edit Blog' : 'Add New Blog'}
            </DialogTitle>
            <DialogDescription>
              {selectedBlog ? 'Update the blog post details.' : 'Create a new blog post.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="blog-url-slug"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief summary of the blog post"
                rows={3}
                required
              />
            </div>

            <div>
              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => handleInputChange('coverImage', url)}
                label="Cover Image"
                placeholder="Upload a cover image for the blog post"
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishedAt">Published Date</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="author">Author ID</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Author reference ID"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isFeatured">Featured Post</Label>
            </div>

            <div>
              <Label htmlFor="metaTitle">SEO Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.seo?.metaTitle || ''}
                onChange={(e) => handleInputChange('seo', {
                  ...formData.seo,
                  metaTitle: e.target.value
                })}
                placeholder="SEO meta title"
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">SEO Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.seo?.metaDescription || ''}
                onChange={(e) => handleInputChange('seo', {
                  ...formData.seo,
                  metaDescription: e.target.value
                })}
                placeholder="SEO meta description"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBlog}
              disabled={isSaving || !formData.title || !formData.slug || !formData.excerpt}
            >
              {isSaving ? 'Saving...' : (selectedBlog ? 'Update Blog' : 'Create Blog')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBlog?.title}"? This action cannot be undone.
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
              {isDeleting ? 'Deleting...' : 'Delete Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}