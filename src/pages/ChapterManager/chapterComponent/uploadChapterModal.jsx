import React, { useState } from "react";
import { Modal, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs"; // 👈 Important

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const { Dragger } = Upload;

export default function UploadChapterModal({ visible, onCancel, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);

  // Function to extract text from files
  const extractTextFromFile = async (file) => {
    const fileType = file.type;

    if (fileType === "application/pdf") {
      // PDF Extraction
      const pdfData = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      return text.trim();
    }
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // DOCX Extraction
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    }
    else if (fileType === "text/plain") {
      // TXT Extraction
      return await file.text();
    }
    else {
      message.error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
      return "";
    }
  };

  const handleBeforeUpload = async (file) => {
    setUploading(true);

    try {
      const extractedText = await extractTextFromFile(file);

      if (extractedText) {
        onUploadSuccess?.(extractedText);
        onCancel();
      }
    } catch (error) {
      message.error("Failed to extract text from the uploaded file.");
    }

    setUploading(false);
    return false; // Prevent default upload
  };

  return (
    <Modal open={visible} onCancel={onCancel} title="Upload Chapter File" footer={null}>
      <Dragger
        multiple={false}
        beforeUpload={handleBeforeUpload}
        disabled={uploading}
        accept=".pdf,.docx,.txt"
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Supported formats: <b>.docx, .pdf, .txt</b>
        </p>
      </Dragger>
    </Modal>
  );
}
