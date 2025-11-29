// src/components/Sidebar.jsx
import React from "react";

const Sidebar = ({
  data,
  keyword,
  setKeyword,
  hasQuery,
  visibleResults,
  searchError,
  handleKeywordSearch,
  handleResultClick,
  topNodes
}) => {
  return (
    <aside className="sidebar">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.8rem",
          textAlign: "left",
          marginBottom: "0.8rem",
          width: "100%"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            lineHeight: 1.15
          }}
        >
          <h1
            style={{
              margin: 0,
              padding: 0,
              fontSize: "1.9rem",
              fontWeight: 700,
              color: "#FDFEFF",
              textShadow: "0 2px 6px rgba(0,0,0,0.3)",
              letterSpacing: "0.01em",
              textAlign: "center"
            }}
          >
            TUMSearch
          </h1>
          <p
            style={{
              margin: 0,
              padding: 0,
              marginTop: "0.2rem",
              fontSize: "1rem",
              color: "#DDE7F6",
              textAlign: "center"
            }}
          >
            PageRank Explorer
          </p>
        </div>
      </div>

      {/* SEARCH ONLY */}
      <section>
        <form
          onSubmit={handleKeywordSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            flexWrap: "wrap"
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              padding: "0.55rem 0.8rem",
              borderRadius: 10,
              border: "1px solid rgba(148, 181, 233, 0.8)",
              background: "rgba(6,14,26,0.95)",
              color: "#E8EEF9",
              fontSize: "0.85rem",
              boxShadow: "0 0 0 1px rgba(10,25,45,0.5) inset"
            }}
          />
        </form>
        {searchError && (
          <p className="error" style={{ marginTop: "0.6rem" }}>
            {searchError}
          </p>
        )}
      </section>

      {/* RESULTS LIST */}
      <section
        style={{
          background: "rgba(5,18,34,0.92)",
          borderRadius: 16,
          padding: "0.65rem 0.85rem 0.8rem",
          border: "1px solid rgba(148,181,233,0.25)",
          boxShadow: "0 12px 28px rgba(2,10,24,0.85)",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem"
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#E5F0FF",
                marginBottom: "0.1rem"
              }}
            >
              Results
            </div>
            {!hasQuery && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#C7D2FE"
                }}
              >
                Latest indexed (highest PageRank)
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#9FB4D8",
              whiteSpace: "nowrap"
            }}
          >
            {visibleResults.length} shown
          </div>
        </div>

        <div
          className="link-list-scroll"
          style={{
            maxHeight: 220,
            overflowY: "auto",
            paddingRight: 2
          }}
        >
          {visibleResults.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleResultClick(n)}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                padding: 0,
                margin: 0,
                cursor: "pointer"
              }}
            >
                            <div
                                style={{
                                    padding: "0.55rem 0.6rem 0.6rem",
                                    borderRadius: 12,
                                    background: "rgba(6,19,40,0.96)",
                                    border: "1px solid rgba(148,181,233,0.9)",
                                    marginBottom: 6,
                                    boxShadow:
                                        "0 10px 24px rgba(2,10,24,0.9), 0 0 0 1px rgba(7,26,57,0.9) inset",
                                    maxWidth: "100%"
                                }}
                            >
                <div
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "#E5F0FF",
                    marginBottom: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {n.title || n.id}
                </div>

                <a
                  href={n.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#93C5FD",
                    fontSize: "0.78rem",
                    textDecoration: "none",
                    maxWidth: "100%"
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "inline-block"
                    }}
                  >
                    {(() => {
                      try {
                        const u = new URL(n.id);
                        const path = u.pathname || "";
                        if (!path || path === "/") return u.hostname;
                        return `…${path}`;
                      } catch {
                        return n.id;
                      }
                    })()}
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* TOP NODES (optional existing) */}
      <section className="sidebar-section">
        <h2>Top PageRank</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>PR</th>
              </tr>
            </thead>
            <tbody>
              {topNodes.slice(0, 5).map((n) => (
                <tr key={n.id}>
                  <td>{n.title || n.id}</td>
                  <td>{(n.pagerank ?? 0).toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
