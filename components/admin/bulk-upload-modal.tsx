'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: Array<{
    row: number;
    productId: string;
    name: string;
  }>;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
  total: number;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isUploading,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result.data.results);
        toast.success(result.data.message);
        if (result.data.results.success.length > 0) {
          onSuccess();
        }
      } else {
        toast.error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsDragging(false);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = [
      'name,description,price,discount,stock,status,label,categories,navigationCategories',
      'Sample Product,This is a sample product description,99.99,10,50,new,best seller,"Category 1, Category 2","Section 1"',
      'Another Product,Another description,149.99,0,25,hot,,Category 1,Section 1'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-bulk-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Products
          </DialogTitle>
          <DialogDescription>
            Upload multiple products at once using an Excel file. You can download a template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Download Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use our template to ensure your data is formatted correctly. The template includes all required and optional fields.
              </p>
              <Button
                onClick={downloadTemplate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select Excel File</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setUploadResult(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-lg font-medium">Drop your Excel file here</p>
                    <p className="text-sm text-gray-500">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports .xlsx and .xls files
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-2xl font-bold text-blue-600">{uploadResult.total}</p>
                      <p className="text-sm text-blue-600">Total Rows</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-2xl font-bold text-green-600">{uploadResult.success.length}</p>
                      <p className="text-sm text-green-600">Successful</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-2xl font-bold text-red-600">{uploadResult.errors.length}</p>
                      <p className="text-sm text-red-600">Errors</p>
                    </div>
                  </div>

                  {/* Successful Products */}
                  {uploadResult.success.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Successfully Uploaded Products ({uploadResult.success.length})
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadResult.success.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                            Row {item.row}: {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {uploadResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Errors ({uploadResult.errors.length})
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadResult.errors.map((item, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Row {item.row}:</strong> {item.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Close
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Products
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}