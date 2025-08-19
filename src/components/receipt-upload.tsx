import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ReceiptUploadProps {
  onUpload?: (file: File) => void;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onUpload?.(selectedFile);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="receipt-upload"
      />
      <label htmlFor="receipt-upload">
        <Button as="span" variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Receipt
        </Button>
      </label>
    </div>
  );
};