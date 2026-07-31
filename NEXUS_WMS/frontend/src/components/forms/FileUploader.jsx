import { useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

export const FileUploader = ({
  accept = '.csv, .xlsx, .json',
  onFileSelect,
  label = 'Upload File',
  description = 'Drag & drop your CSV or Excel document here, or click to browse',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl p-6 text-center transition cursor-pointer bg-surface-50/50 dark:bg-surface-800/20"
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            id="file-upload-input"
          />
          <label htmlFor="file-upload-input" className="cursor-pointer block space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mx-auto flex items-center justify-center">
              <UploadCloud className="h-6 w-6" />
            </div>
            <span className="block text-sm font-semibold text-surface-900 dark:text-white">
              {label}
            </span>
            <span className="block text-xs text-surface-500 dark:text-surface-400">
              {description}
            </span>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-600 text-white">
              <File className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-semibold text-surface-900 dark:text-white">
                {selectedFile.name}
              </span>
              <span className="block text-xs text-surface-500">
                {(selectedFile.size / 1024).toFixed(1)} KB — Ready for processing
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success-600" />
            <button
              onClick={removeFile}
              className="p-1 rounded-lg text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
