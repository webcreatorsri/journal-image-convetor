import React, { useState } from "react";
import "../styles/Converter.css";
import TiffCanvas from "./TiffCanvas";

export default function Converter() {
  const [previewFiles, setPreviewFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setPreviewFiles([]);
      setResult(<p className="error">Error: Maximum 5 images allowed.</p>);
      return;
    }

    setPreviewFiles(files);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (previewFiles.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    for (let f of previewFiles) {
      if (f.size > 10 * 1024 * 1024) {
        setResult(
          <p className="error">Error: One or more images exceed 10MB limit.</p>
        );
        return;
      }
    }

    const formData = new FormData();
    previewFiles.forEach((f) => formData.append("images", f));
    formData.append("journal", document.getElementById("journal").value);
    formData.append("grayscale", document.getElementById("grayscale").checked);
    formData.append("resize", document.getElementById("resize").checked);
    formData.append("compress", document.getElementById("compress").checked);

    setLoading(true);
    setResult(
      <div className="processing">
        <h3>Processing images, please wait...</h3>
        <p>This may take a few moments depending on image size and selected options.</p>
      </div>
    );

    try {
      const response = await fetch(
        "https://image-converter-704939541071.asia-south1.run.app/api/convert",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.error) {
        setResult(<div className="error">Error: {data.error}</div>);
        return;
      }

      if (!data.converted_images || data.converted_images.length === 0) {
        setResult(<div className="error">No converted images received from server</div>);
        return;
      }

      const resultsJsx = (
        <div>
          <div className="success">
            <h2>✓ Conversion Completed Successfully</h2>
            <p>Images have been processed according to journal requirements.</p>
          </div>

          {data.converted_images.map((img, index) => {
            const originalFile = previewFiles[index];
            const originalUrl = URL.createObjectURL(originalFile);

            let mimeType = "image/jpeg";
            switch (img.format?.toLowerCase()) {
              case "png": mimeType = "image/png"; break;
              case "tiff": case "tif": mimeType = "image/tiff"; break;
              case "jpg": case "jpeg": mimeType = "image/jpeg"; break;
            }

            return (
              <div className="image-container" key={index}>
                <h3>Image {index + 1}: {originalFile.name}</h3>
                <div className="comparison-container">
                  <div className="image-column">
                    <h4>Original Image</h4>
                    <img src={originalUrl} alt="Original" />
                  </div>

                  <div className="image-column">
                    <h4>Converted Image</h4>
                    {img.format?.toLowerCase() === "tiff" ? (
                      <TiffCanvas base64Data={img.data} />
                    ) : (
                      <img src={`data:${mimeType};base64,${img.data}`} alt={`Converted ${img.filename}`} />
                    )}

                    <a
                      href={`data:${mimeType};base64,${img.data}`}
                      download={`converted_${img.filename}`}
                      className="download-btn"
                    >
                      📥 Download Converted Image
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {data.report && (
            <div className="report-section">
              <h3>📊 Detailed Conversion Report</h3>
              <pre>{data.report}</pre>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(data.report)}`}
                download="image_conversion_report.txt"
                className="download-btn"
              >
                📄 Download Full Report
              </a>
            </div>
          )}
        </div>
      );

      setResult(resultsJsx);
    } catch (err) {
      setResult(
        <div className="error">
          <h3>❌ Conversion Failed</h3>
          <p>{err.message}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="converter-container">
      <header className="converter-header">
        <h1>Journal Image Converter</h1>
      </header>

      <p className="converter-description">
        Convert your images to meet journal publication requirements
      </p>

      <form onSubmit={handleSubmit} className="converter-form">
        <div className="form-group">
          <label htmlFor="images">Upload Images (max 5, &lt;10MB each):</label>
          <input type="file" id="images" multiple accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="form-group">
          <label htmlFor="journal">Select Journal:</label>
          <select id="journal" name="journal">
            <option value="Nature">Nature</option>
            <option value="Science">Science</option>
            <option value="Cell">Cell</option>
            <option value="PNAS">PNAS</option>
            <option value="PLOS ONE">PLOS ONE</option>
            <option value="IEEE Transactions">IEEE Transactions</option>
            <option value="ACS Journals">ACS Journals</option>
            <option value="Elsevier Journals">Elsevier Journals</option>
            <option value="Springer Journals">Springer Journals</option>
            <option value="Wiley Journals">Wiley Journals</option>
            <option value="The Lancet">The Lancet</option>
          </select>
        </div>

        <div className="form-group">
          <label>Processing Options:</label>
          <div className="checkbox-group">
            <label><input type="checkbox" id="grayscale" name="grayscale" /> <span className="switch"></span> Convert to Grayscale</label>
            <label><input type="checkbox" id="resize" name="resize" /> <span className="switch"></span> Resize to Journal Requirements</label>
            <label><input type="checkbox" id="compress" name="compress" /> <span className="switch"></span> Compress File Size</label>
          </div>
        </div>

        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Convert Images"}</button>
      </form>

      <div id="result">{result}</div>
    </div>
  );
}
