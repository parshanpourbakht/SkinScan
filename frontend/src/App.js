import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
  
    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    console.log("Sending image to backend:", image); 
  
    try {
      const response = await axios.post("http://54.185.185.103:5000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    
      console.log("API response:", response.data); 
      setResult(response.data);
    } catch (error) {
      console.error("Upload error:", error);

      if (error.response) {
        console.error("Backend responded with:", error.response.data);
        setResult({ error: error.response.data.error || "Server responded with an error." });
      } else if (error.request) {
        console.error("No response received. Axios request:", error.request);
        setResult({ error: "No response received from the server." });
      } else {
        console.error("Error setting up the request:", error.message);
        setResult({ error: "Error setting up the request." });
      }
    }
  
    setLoading(false);
  };
  

  return (
    <div className="app-container">
      <h1 className="title">AI SkinScan Dashboard</h1>
      <hr className="title-line" />
      <div className="app-content">
      {/* Upload */}
      <div className="box">
        <h2>Upload Image</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
        {preview && (
            <div className="preview-container">
              <h3>Image Preview</h3>
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}
                  <button onClick={handleUpload} className="upload-button" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* Result */}
      <div className="box">
        <h2>Analysis Result</h2>
        {result ? (
          result.error ? (
            <p className="error-text">{result.error}</p>
          ) : (
            <div className="result-text">
              <p className="bold">Prediction: {result.prediction}</p>
              <p>Confidence: {Math.round(result.confidence * 100)}%</p>
            </div>
          )
        ) : (
          <p className="placeholder-text">No result yet.</p>
        )}
      </div>
      </div>
      
    </div>
  );
}

export default App;
