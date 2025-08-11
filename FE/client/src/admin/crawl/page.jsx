import React, { useState } from "react";
import "./crawl.css";

export default function CrawlPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCrawlToggle = async () => {
    if (!loading) {
      setLoading(true);
      setSuccess(false);
      try {
        const res = await fetch("http://localhost:5000/api/crawl", { method: "POST" });
        const data = await res.json();
        console.log("Crawl result:", data.message);
        setLoading(false);
        setSuccess(true);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    } else {
      try {
        await fetch("http://localhost:5000/api/stop-crawl", { method: "POST" });
        console.log("Crawl stopped.");
        setLoading(false);
      } catch (err) {
        console.error("Error stopping crawl:", err);
      }
    }
  };

  return (
    <div className="card crawl-container">
      <button className="crawl-btn" onClick={handleCrawlToggle}>
        {loading ? "Dừng Crawl" : "Bắt đầu Crawl"}
      </button>

      {loading && (
        <div className="loader">
          <div className="dot dot1"></div>
          <div className="dot dot2"></div>
          <div className="dot dot3"></div>
        </div>
      )}

      {success && <div className="success-msg">✅ Crawl thành công!</div>}
    </div>
  );
}
