"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  _id: string;
  title: string;
  description?: string;
  image?: any;
  parent?: { _id: string; title: string };
  level: number;
  order: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as any,
    parent: "",
    order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setFlatCategories(data);
    setCategories(buildCategoryTree(data));
  };

  const buildCategoryTree = (cats: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Initialize all categories
    cats.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Build tree structure
    cats.forEach(cat => {
      const category = categoryMap.get(cat._id)!;
      if (cat.parent?._id) {
        const parent = categoryMap.get(cat.parent._id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Sort by order
    const sortByOrder = (a: Category, b: Category) => (a.order || 0) - (b.order || 0);
    rootCategories.sort(sortByOrder);
    rootCategories.forEach(cat => {
      if (cat.children) cat.children.sort(sortByOrder);
      cat.children?.forEach(subCat => {
        if (subCat.children) subCat.children.sort(sortByOrder);
      });
    });

    return rootCategories;
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory ? `/api/admin/categories/${editingCategory._id}` : "/api/admin/categories";
    const method = editingCategory ? "PATCH" : "POST";

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description || "");
    submitData.append("parent", formData.parent || "");
    submitData.append("order", formData.order.toString());

    if (formData.image instanceof File) {
      submitData.append("image", formData.image);
    }

    const res = await fetch(url, {
      method,
      body: submitData,
    });

    if (res.ok) {
      toast({ title: `Category ${editingCategory ? "updated" : "created"} successfully` });
      setIsOpen(false);
      setFormData({ title: "", description: "", image: null, parent: "", order: 0 });
      setEditingCategory(null);
      fetchCategories();
    } else {
      const error = await res.json();
      toast({ title: "Error", description: error.error || "Failed to save category", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? All subcategories will also be deleted.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Category deleted" });
      fetchCategories();
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title,
      description: cat.description || "",
      image: cat.image,
      parent: cat.parent?._id || "",
      order: cat.order || 0
    });
    setIsOpen(true);
  };

  const getAvailableParents = () => {
    if (!editingCategory) {
      // For new categories, only show main and sub categories (not sub-sub)
      return flatCategories.filter(cat => cat.level < 2);
    }
    // For editing, prevent selecting self or descendants
    return flatCategories.filter(cat =>
      cat._id !== editingCategory._id &&
      cat.level < 2 &&
      (!cat.parent || cat.parent._id !== editingCategory._id)
    );
  };

  const renderCategoryRow = (cat: Category, depth: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCategories.has(cat._id);
    const indent = depth * 40;

    return (
      <div key={cat._id}>
        <div className="flex items-center p-3 border-b hover:bg-gray-50" style={{ paddingLeft: `${indent + 16}px` }}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(cat._id)} className="mr-2">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {cat.image?.url && (
            <img src={cat.image.url} alt={cat.title} className="w-10 h-10 object-cover rounded mr-3" />
          )}

          <div className="flex-1">
            <h3 className="font-semibold">{cat.title}</h3>
            <p className="text-sm text-gray-500">
              Level {cat.level} • Order: {cat.order || 0}
              {cat.parent && ` • Parent: ${cat.parent.title}`}
            </p>
          </div>

          <div className="flex gap-2">
            {cat.level < 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData({ title: "", description: "", image: null, parent: cat._id, order: 0 });
                  setIsOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Sub
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(cat._id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && cat.children?.map(child => renderCategoryRow(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-gray-600">Manage 3-level category hierarchy</p>
        </div>
        <Button onClick={() => {
          setEditingCategory(null);
          setFormData({ title: "", description: "", image: null, parent: "", order: 0 });
          setIsOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Main Category
        </Button>
      </div>

      <Card className="overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No categories yet. Click "Add Main Category" to create one.
          </div>
        ) : (
          categories.map(cat => renderCategoryRow(cat))
        )}
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit" : "Add"} Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category Title</label>
              <Input
                placeholder="e.g., Furniture, Bedroom, King Size Bed"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Parent Category</label>
              <Select
                value={formData.parent}
                onValueChange={(value) => setFormData({ ...formData, parent: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent (leave empty for main category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Main Category)</SelectItem>
                  {getAvailableParents().map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.level === 0 ? cat.title : `└─ ${cat.title} (under ${cat.parent?.title})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Max 3 levels: Main → Sub → Sub-Sub
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Display Order</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Category description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category Image</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {formData.image ? (
                    typeof formData.image === "string" || formData.image?.url || formData.image?.asset?.url ? (
                      <img
                        src={formData.image?.url || formData.image?.asset?.url || formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : formData.image instanceof File ? (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a category image (JPG, PNG, etc.)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Category</Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
