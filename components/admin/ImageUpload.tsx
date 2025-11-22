'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  placeholder = 'Click to upload or drag and drop',
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
  },
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    // Upload image via admin endpoint (uses Sanity asset storage)
    try {
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        return result.imageUrl;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || uploading) return;

    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [disabled, uploading, maxSize, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || uploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative group">
              <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                <img
                  src={value}
                  alt="Uploaded image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  disabled={disabled}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 truncate">{value}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive || dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />

              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Uploading...</p>
                    <p className="text-sm text-gray-500">Please wait while we upload your image</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>

                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isDragActive ? 'Drop your image here' : placeholder}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse from your device
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Supported formats: {Object.values(accept).flat().join(', ')}</p>
                    <p>Maximum size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}