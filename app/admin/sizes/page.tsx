"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { Label } from "@/components/ui/label";

interface Size {
  _id: string;
  name: string;
  slug: { current: string };
  width: number;
  length: number;
  displayOrder: number;
}

export default function SizesPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    width: 0,
    length: 0,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      const res = await fetch("/api/admin/sizes");
      if (res.ok) {
        const data = await res.json();
        setSizes(data.sizes || []);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
      toast.error("Failed to load sizes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSize
        ? `/api/admin/sizes?id=${editingSize._id}`
        : "/api/admin/sizes";
      const method = editingSize ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(
          editingSize ? "Size updated successfully" : "Size created successfully"
        );
        setIsOpen(false);
        resetForm();
        fetchSizes();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save size");
      }
    } catch (error) {
      console.error("Error saving size:", error);
      toast.error("Failed to save size");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return;

    try {
      const res = await fetch(`/api/admin/sizes?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Size deleted successfully");
        fetchSizes();
      } else {
        toast.error("Failed to delete size");
      }
    } catch (error) {
      console.error("Error deleting size:", error);
      toast.error("Failed to delete size");
    }
  };

  const handleEdit = (size: Size) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      width: size.width,
      length: size.length,
      displayOrder: size.displayOrder || 0,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      width: 0,
      length: 0,
      displayOrder: 0,
    });
    setEditingSize(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mattress Sizes</h2>
          <p className="text-gray-600">Manage available mattress sizes</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Size
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((size) => (
                <TableRow key={size._id}>
                  <TableCell className="font-medium">{size.name}</TableCell>
                  <TableCell>
                    {size.width}' x {size.length}'
                  </TableCell>
                  <TableCell>{size.displayOrder || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(size)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(size._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sizes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No sizes found. Add your first size to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSize ? "Edit Size" : "Add New Size"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Size Name</Label>
              <Input
                id="name"
                placeholder="e.g., 5 feet x 7 feet"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (feet)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      width: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="length">Length (feet)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      length: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingSize ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
