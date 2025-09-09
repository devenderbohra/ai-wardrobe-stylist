/**
 * Image upload component with drag-and-drop functionality
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { cn, validateImageFile, formatFileSize } from '@/src/utils';
import { Button } from '.';

export interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  onRemove?: (index: number) => void;
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  uploadProgress?: { file: File; progress: number; status: string }[];
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  disabled = false,
  uploadProgress = [],
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors: string[] = [];
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            newErrors.push(`${file.name}: File too large (max ${formatFileSize(maxSize)})`);
          } else if (error.code === 'file-invalid-type') {
            newErrors.push(`${file.name}: Invalid file type`);
          } else if (error.code === 'too-many-files') {
            newErrors.push(`Too many files (max ${maxFiles})`);
          } else {
            newErrors.push(`${file.name}: ${error.message}`);
          }
        });
      });
      setErrors(newErrors);
    }
    
    // Validate accepted files
    const validFiles: File[] = [];
    acceptedFiles.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        setErrors(prev => [...prev, `${file.name}: ${validation.error}`]);
      }
    });
    
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  }, [onUpload, maxSize, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize,
    maxFiles,
    multiple,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'dropzone',
          isDragActive && 'dropzone-active',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop your images here' : 'Drag &amp; drop images here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <span className="text-purple-600 font-medium">browse files</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPEG, PNG, WebP up to {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Uploading Files</h4>
          {uploadProgress.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.file.name}
                </span>
                <div className="flex items-center space-x-2">
                  {item.status === 'complete' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              {item.status !== 'complete' && item.status !== 'error' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              
              {/* Status text */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{item.status === 'complete' ? 'Complete' : item.status}</span>
                <span>{formatFileSize(item.file.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;