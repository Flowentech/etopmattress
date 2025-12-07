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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Package,
  Search,
  Filter,
  TrendingUp,
  ShoppingCart,
  Store,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Upload,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import BulkUploadModal from '@/components/admin/bulk-upload-modal';
import AddProductModal from '@/components/admin/add-product-modal';
import EditProductModal from '@/components/admin/edit-product-modal';

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  image?: any;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  label?: string;
  status: string;
  isApproved: boolean;
  _createdAt: string;
  _updatedAt: string;
  categories: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>;
  navigationcategory?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>;
  hasVariants?: boolean;
  priceVariants?: Array<{
    size: { _id: string; name?: string };
    height: { _id: string; name?: string };
    price: number;
    stock: number;
  }>;
}

interface ProductsResponse {
  products: Product[];
  stats: {
    status: {
      total: number;
      new: number;
      hot: number;
      sale: number;
    };
    approval: {
      approved: number;
      pending: number;
      total: number;
    };
    stores: Record<string, number>;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  const [stats, setStats] = useState({
    status: {
      total: 0,
      new: 0,
      hot: 0,
      sale: 0
    },
    approval: {
      approved: 0,
      pending: 0,
      total: 0
    },
    stores: {}
  });
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, [statusFilter, pagination.offset, searchTerm]);

  const loadProducts = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/products?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setProducts(result.data.products || []);
        setStats(result.data.stats || stats);
        setPagination(result.data.pagination || pagination);
      } else {
        console.error('Unexpected API response structure:', result);
        toast.error('Failed to load products: Invalid response format');
        setProducts([]);
        setStats({
          status: { total: 0, new: 0, hot: 0, sale: 0 },
          approval: { approved: 0, pending: 0, total: 0 },
          stores: {}
        });
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      const errorMessage = error?.message || 'Failed to load products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      new: { color: 'bg-green-100 text-green-800', label: 'New' },
      hot: { color: 'bg-red-100 text-red-800', label: 'Hot' },
      sale: { color: 'bg-orange-100 text-orange-800', label: 'Sale' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return (
      <Badge variant="outline" className={isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
        {isApproved ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Pending
          </>
        )}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleUpdateApproval = async (productId: string, isApproved: boolean) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, isApproved }),
      });

      if (response.ok) {
        toast.success(`Product ${isApproved ? 'approved' : 'unapproved'} successfully`);
        loadProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error?.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/products?productId=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        setDeleteProductId(null);
        loadProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error?.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const handleRefresh = () => {
    setPagination({
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false
    });
    loadProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadProducts}>Try Again</Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600">Manage products across all stores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddProductModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
          <Button onClick={() => setIsBulkUploadModalOpen(true)} variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.status.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approval.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.approval.pending}</p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hot Products</p>
                <p className="text-2xl font-bold text-red-600">{stats.status.hot}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={product.image.url || product.image.asset?.url || ''}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.slug?.current}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.categories && product.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.categories.slice(0, 2).map((category) => (
                            <Badge key={category._id} variant="outline" className="text-xs">
                              {category?.title}
                            </Badge>
                          ))}
                          {product.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No categories</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.discount > 0 && (
                          <p className="text-sm text-green-600">
                            {product.discount}% off
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.stock}</p>
                        <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? 'In stock' : 'Out of stock'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(product.status)}
                    </TableCell>
                    <TableCell>
                      {getApprovalBadge(product.isApproved)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(product._createdAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProductToEdit(product);
                            setIsEditProductModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!product.isApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateApproval(product._id, true)}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteProductId(product?._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product?.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product._id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ) )}
                {products.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Review and manage product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedProduct.image && (selectedProduct.image.url || selectedProduct.image.asset?.url) ? (
                      <img
                        src={selectedProduct.image.url || selectedProduct.image.asset.url}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold">{formatPrice(selectedProduct.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="font-semibold">{selectedProduct.discount}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="font-semibold">{selectedProduct.stock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Label</p>
                      <p className="font-semibold">{selectedProduct.label || 'None'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      {getStatusBadge(selectedProduct.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Approval</span>
                      {getApprovalBadge(selectedProduct.isApproved)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedProduct.categories && selectedProduct.categories.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.categories.map((category) => (
                      <Badge key={category._id} variant="secondary">
                        {category?.title || 'Unknown Category'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="mb-1">Created</p>
                  <p>{formatDate(selectedProduct._createdAt)}</p>
                </div>
                <div>
                  <p className="mb-1">Last Updated</p>
                  <p>{formatDate(selectedProduct._updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Close
            </Button>
            {!selectedProduct?.isApproved && (
              <Button
                onClick={() => {
                  handleUpdateApproval(selectedProduct._id, true);
                  setSelectedProduct(null);
                }}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSuccess={() => {
          handleRefresh();
          setIsAddProductModalOpen(false);
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSuccess={() => {
          handleRefresh();
          setIsEditProductModalOpen(false);
          setProductToEdit(null);
        }}
        product={productToEdit}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={() => {
          handleRefresh();
          setIsBulkUploadModalOpen(false);
        }}
      />
    </div>
  );
}