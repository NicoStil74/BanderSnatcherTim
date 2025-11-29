// src/hooks/useCrawler.js
import { useState, useCallback } from "react";

const API_BASE = "http://localhost:5001";

// --------------------------
// URL NORMALIZER
// --------------------------
function normalizeUrl(input) {
  let url = input.trim();

  if (!url) return null;

  // Add protocol if missing (http/https)
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // No forced "www.", no forced "/de/"
  return url;
}

function useCrawler(initialUrl = "https://www.tum.de") {
  const [siteUrl, setSiteUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crawlResult, setCrawlResult] = useState(null); // { graph, titles, crawl_info }

  const runCrawl = useCallback(async () => {
    const normalized = normalizeUrl(siteUrl);

    if (!normalized) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setError("");
    setCrawlResult(null);

    try {
      const resp = await fetch(
        `${API_BASE}/api/crawl?url=${encodeURIComponent(normalized)}`
      );

      if (!resp.ok) {
        let msg = `Crawler failed with status ${resp.status}`;
        try {
          const body = await resp.json();
          if (body && body.error) msg = body.error;
        } catch (_) {
          // ignore JSON parse errors here
        }
        throw new Error(msg);
      }

      const json = await resp.json(); // { graph, titles, crawl_info }
      setCrawlResult(json);
    } catch (e) {
      console.error("Crawler request error:", e);
      setError(e.message || "Something went wrong while crawling.");
    } finally {
      setLoading(false);
    }
  }, [siteUrl]);

  return {
    siteUrl,
    setSiteUrl,
    loading,
    error,
    crawlResult,
    runCrawl
  };
}

export default useCrawler;
