import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
export default function HtmlBookViewer({ html, isOpen }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (!isOpen || !html) return;

    const generatePdf = async () => {
      const container = document.createElement("div");
      container.style.width = "794px"; // A4 width
      container.style.padding = "40px";
      container.style.background = "#fff";
      container.innerHTML = html;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "px", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const blob = pdf.output("blob");
      setPdfUrl(URL.createObjectURL(blob));

      document.body.removeChild(container);
    };

    generatePdf();
  }, [html, isOpen]);

  if (!isOpen || !pdfUrl) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        <div style={{ display: "flex", gap: 16 }}>
          <Page pageNumber={1} width={500} />
          {numPages > 1 && <Page pageNumber={2} width={500} />}
        </div>
      </Document>
    </div>
  );
}
