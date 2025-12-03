"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
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

interface Height {
  _id: string;
  name: string;
  slug: { current: string };
  value: number;
  displayOrder: number;
}

export default function HeightsPage() {
  const [heights, setHeights] = useState<Height[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingHeight, setEditingHeight] = useState<Height | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    value: 0,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchHeights();
  }, []);

  const fetchHeights = async () => {
    try {
      const res = await fetch("/api/admin/heights");
      if (res.ok) {
        const data = await res.json();
        setHeights(data.heights || []);
      }
    } catch (error) {
      console.error("Error fetching heights:", error);
      toast.error("Failed to load heights");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingHeight
        ? `/api/admin/heights?id=${editingHeight._id}`
        : "/api/admin/heights";
      const method = editingHeight ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(
          editingHeight
            ? "Height updated successfully"
            : "Height created successfully"
        );
        setIsOpen(false);
        resetForm();
        fetchHeights();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save height");
      }
    } catch (error) {
      console.error("Error saving height:", error);
      toast.error("Failed to save height");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this height?")) return;

    try {
      const res = await fetch(`/api/admin/heights?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Height deleted successfully");
        fetchHeights();
      } else {
        toast.error("Failed to delete height");
      }
    } catch (error) {
      console.error("Error deleting height:", error);
      toast.error("Failed to delete height");
    }
  };

  const handleEdit = (height: Height) => {
    setEditingHeight(height);
    setFormData({
      name: height.name,
      value: height.value,
      displayOrder: height.displayOrder || 0,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      value: 0,
      displayOrder: 0,
    });
    setEditingHeight(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mattress Heights</h2>
          <p className="text-gray-600">Manage available mattress heights</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Height
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Heights</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Value (inches)</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {heights.map((height) => (
                <TableRow key={height._id}>
                  <TableCell className="font-medium">{height.name}</TableCell>
                  <TableCell>{height.value}"</TableCell>
                  <TableCell>{height.displayOrder || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(height)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(height._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {heights.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No heights found. Add your first height to get started.
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
              {editingHeight ? "Edit Height" : "Add New Height"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Height Name</Label>
              <Input
                id="name"
                placeholder="e.g., 4 inch, 5 inch"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Height Value (inches)</Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                min="0"
                value={formData.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value: parseFloat(e.target.value),
                  })
                }
                required
              />
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
                {loading ? "Saving..." : editingHeight ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
