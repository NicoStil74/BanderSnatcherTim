// src/hooks/useCrawler.js
import { useState, useCallback } from "react";

const API_BASE = "http://localhost:5001";

// --------------------------
// URL NORMALIZER
// --------------------------
function normalizeUrl(input) {
  let url = (input || "").trim();

  // Add protocol if missing but otherwise leave host/path intact so non-TUM
  // sites are not rewritten into 404s.
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    return new URL(url).toString();
  } catch {
    return null; // invalid URL
  }
}

// --------------------------
// CHECK IF SITE IS REACHABLE
// --------------------------
async function checkReachable(url) {
  return true; // Browser can't check. Let the backend validate.
}


function useCrawler(initialUrl = "https://www.tum.de/de/") {
  const [siteUrl, setSiteUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crawlResult, setCrawlResult] = useState(null);

  const runCrawl = useCallback(async () => {
    const normalized = normalizeUrl(siteUrl);

    if (!normalized) {
      setError("Invalid URL format.");
      return;
    }

    setLoading(true);
    setError("");
    setCrawlResult(null);

    // -----------------------
    // REACHABILITY CHECK
    // -----------------------
    const ok = await checkReachable(normalized);

    if (!ok) {
      setLoading(false);
      setError("Site is unreachable or not an HTML page.");
      return;
    }

    try {
      const resp = await fetch(
        `${API_BASE}/api/crawl?url=${encodeURIComponent(normalized)}`
      );

      if (!resp.ok) {
        let msg = `Crawler failed with status ${resp.status}`;
        try {
          const body = await resp.json();
          if (body && body.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }

      const json = await resp.json();
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
