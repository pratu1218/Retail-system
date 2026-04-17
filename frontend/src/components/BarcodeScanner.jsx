import { useRef, useState } from "react";
import { X, Camera, Upload, Loader } from "lucide-react";

const BarcodeScanner = ({ onScan, onClose }) => {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState("");

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    // Show preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      await extractBarcode(base64);
    };
    reader.readAsDataURL(file);
  };

  const extractBarcode = async (base64DataUrl) => {
    try {
      // Strip the data:image/...;base64, prefix
      const base64Data = base64DataUrl.split(",")[1];
      const mediaType = base64DataUrl.split(";")[0].split(":")[1];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data
                  }
                },
                {
                  type: "text",
                  text: "Look at this image and find the barcode. Return ONLY the barcode number digits, nothing else. No explanation, no text, just the number. If there are multiple barcodes pick the main product barcode (usually EAN-13 which is 13 digits). If no barcode found, return: NONE"
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const result = data?.content?.[0]?.text?.trim();

      if (!result || result === "NONE" || result.toLowerCase().includes("none")) {
        setError("No barcode found in image. Try a clearer photo or enter manually below.");
      } else {
        // Clean up — keep only digits
        const cleaned = result.replace(/\D/g, "");
        if (cleaned.length > 3) {
          onScan(cleaned);
          onClose();
        } else {
          setError("Could not read barcode clearly. Try better lighting or enter manually.");
        }
      }
    } catch (err) {
      setError("AI scan failed. Please enter the barcode manually below.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 99999
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "24px",
        width: "100%", maxWidth: "460px", margin: "0 16px"
      }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "20px"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              AI Barcode Scanner
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              Take a photo of the product barcode
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "8px",
            padding: "8px", cursor: "pointer", display: "flex", flexShrink: 0
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Image preview or upload area */}
        {preview ? (
          <div style={{ marginBottom: "16px", position: "relative" }}>
            <img
              src={preview}
              alt="Barcode preview"
              style={{
                width: "100%", borderRadius: "10px",
                maxHeight: "240px", objectFit: "contain",
                background: "#f8fafc", border: "1px solid #e2e8f0"
              }}
            />
            {loading && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                borderRadius: "10px", gap: "10px"
              }}>
                <Loader size={28} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#3b82f6" }}>
                  AI is reading the barcode...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed #cbd5e1", borderRadius: "12px",
              padding: "40px 20px", textAlign: "center",
              cursor: "pointer", marginBottom: "16px",
              background: "#f8fafc", transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}
          >
            <Camera size={36} color="#94a3b8" style={{ marginBottom: "12px" }} />
            <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 600, color: "#374151" }}>
              Take or upload a photo
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
              Point your phone camera at the barcode and upload the photo
            </p>
          </div>
        )}

        {/* Hidden file input — capture="environment" opens camera on phones */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />

        {/* Action buttons */}
        {!loading && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current?.click(); }}
              style={{
                flex: 1, padding: "10px", background: "#f1f5f9",
                border: "1px solid #e2e8f0", borderRadius: "8px",
                cursor: "pointer", fontSize: "13px", fontWeight: 600,
                color: "#374151", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "6px"
              }}
            >
              <Upload size={15} /> Upload Image
            </button>
            <button
              onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current?.click(); }}
              style={{
                flex: 1, padding: "10px", background: "#0f172a",
                border: "none", borderRadius: "8px", cursor: "pointer",
                fontSize: "13px", fontWeight: 600, color: "#fff",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "6px"
              }}
            >
              <Camera size={15} /> Open Camera
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "10px", padding: "12px", marginBottom: "16px"
          }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* Manual entry */}
        <div style={{
          borderTop: "1px solid #f1f5f9", paddingTop: "16px"
        }}>
          <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Or enter barcode manually:
          </p>
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. 8901234567890"
              style={{
                flex: 1, padding: "10px 12px",
                border: "1px solid #d1d5db", borderRadius: "8px",
                fontSize: "14px", outline: "none"
              }}
            />
            <button type="submit" style={{
              padding: "10px 16px", background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: 600, fontSize: "14px"
            }}>
              Add
            </button>
          </form>
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#94a3b8" }}>
            The number printed below the barcode lines on the product
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;