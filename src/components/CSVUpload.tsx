import React, { useCallback, useState, useRef } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { message } from "antd";

interface CSVUploadProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export function CSVUpload({ onUpload, loading = false }: CSVUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files[0];

      if (!csvFile) return;

      if (!csvFile.name.endsWith(".csv")) {
        message.error("Please upload a CSV file");
        return;
      }

      try {
        await onUpload(csvFile);
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [onUpload]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".csv")) {
        message.error("Please upload a CSV file");
        return;
      }

      try {
        await onUpload(file);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [onUpload]
  );

  const handleClick = () => {
    if (!loading && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragActive ? "!border-blue-500 !bg-blue-50" : "!border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        data-testid="drop-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
          disabled={loading}
          data-testid="file-input"
          aria-label="Upload CSV file"
        />

        {loading ? (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-2"></div>
            <p className="text-gray-500">Uploading...</p>
          </div>
        ) : (
          <>
            <UploadOutlined className="text-3xl text-gray-400 mb-3" />
            <p className="mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">CSV files only (max 1MB)</p>
          </>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>• Your CSV should include: Date, Description, Amount, Currency</p>
        <p>• Duplicate transactions will be automatically detected</p>
      </div>
    </div>
  );
}
