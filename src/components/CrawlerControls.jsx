import React from "react";

function CrawlerControls({
  siteUrl,
  setSiteUrl,
  loading,
  error,
  onCrawl
}) {
  return (
    <div
      style={{
        marginBottom: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem"
      }}
    >
      <span
        style={{
          fontSize: "0.82rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#A8B3C4"
        }}
      >
        Website to crawl
      </span>
      <input
        type="url"
        value={siteUrl}
        onChange={(e) => setSiteUrl(e.target.value)}
        placeholder="https://www.tum.de"
        style={{
          flex: 1,
          maxWidth: 420,
          padding: "0.45rem 0.75rem",
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.7)",
          background: "rgba(15,23,42,0.96)",
          color: "#F9FAFB",
          fontSize: "0.82rem"
        }}
      />
      <button
        type="button"
        onClick={onCrawl}
        disabled={loading}
        style={{
          padding: "0.42rem 0.95rem",
          borderRadius: 999,
          border: "none",
          background: "#FFCB05",
          color: "#02101F",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? "Crawling..." : "Crawl"}
      </button>
      {error && (
        <span
          style={{
            marginLeft: "0.4rem",
            fontSize: "0.78rem",
            color: "#FCA5A5"
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

export default CrawlerControls;
