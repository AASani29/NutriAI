import { useAuth } from '@clerk/clerk-react';
import {
  AlertCircle,
  Camera,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useBackgroundJob } from '../../context/BackgroundJobContext';

interface ImageUploadModalProps {
  inventoryId: string;
  onClose: () => void;
  onSuccess: (extractedItems: any[]) => void;
}

export default function ImageUploadModal({
  inventoryId,
  onClose,
  onSuccess: _onSuccess,
}: ImageUploadModalProps) {
  const { getToken } = useAuth();
  const { addJob } = useBackgroundJob();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const API_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const token = await getToken();

      const ocrResponse = await fetch(
        `${API_URL}/inventories/${inventoryId}/items/from-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const result = await ocrResponse.json();

      if (result.data && result.data.jobId) {
        // Hand off to background worker
        addJob(result.data.jobId);
        onClose(); // Close modal immediately
      } else {
        throw new Error('No Job ID returned from server');
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] border border-primary/20 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        <div className="bg-white border-b border-border/40 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-primary/20">
              <Camera className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Smart Pantry Scan
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                AI will process your receipt in the background
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-muted-foreground hover:text-secondary hover:bg-primary/20 transition-all shadow-sm"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          {!preview && (
            <div
              className="border-2 border-dashed border-primary/30 rounded-[2.5rem] p-16 text-center hover:border-secondary/40 hover:bg-primary/5 transition-all duration-500 cursor-pointer group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20">
                <Upload className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
                Drop your receipt here
              </h3>
              <p className="text-xs font-medium text-muted-foreground mb-8">
                Or click to browse (JPEG, PNG, WebP up to 10MB)
              </p>
              <button
                type="button"
                className="px-8 py-4 bg-secondary text-white rounded-2xl hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/20 transition-all font-bold text-[10px] uppercase tracking-widest"
              >
                Select Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="relative rounded-[2rem] overflow-hidden border border-border/40 shadow-inner bg-gray-50">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-[400px] object-contain p-4"
                />
                {!uploading && (
                  <button
                    onClick={handleClear}
                    className="absolute top-4 right-4 w-10 h-10 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all active:scale-90 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 animate-shake">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mb-1">Upload Error</p>
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="p-8 bg-primary/10 rounded-[2.5rem] text-center border border-primary/20 animate-pulse">
              <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground tracking-tight">
                Uploading to Intelligence Engine...
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-2 uppercase tracking-widest opacity-60">Stand by for AI processing</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-border/40 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-5 bg-white text-muted-foreground rounded-2xl hover:bg-gray-50 hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-widest border border-border/40"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-8 py-5 bg-secondary text-white rounded-2xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Deep Scan Receipt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
