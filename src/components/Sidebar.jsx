// src/components/Sidebar.jsx
import React from "react";
import logo from "../assets/TUMSEARCH.png";

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
    <aside
      style={{
        flex: "0 0 45%",
        maxWidth: 560,
        minWidth: 360,
        padding: "2rem",
        borderRight: "1px solid rgba(171,183,197,0.4)",
        background: "linear-gradient(180deg, #0B2A4A 0%, #02101F 100%)",
        display: "flex",
        flexDirection: "column",
        gap: "1.6rem",
        boxSizing: "border-box"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.3rem",
          textAlign: "left",
          marginBottom: "0.8rem",
          width: "100%"
        }}
      >
        <img
          src={logo}
          alt="TUMSearch logo"
          style={{
            height: 75,
            width: 75,
            objectFit: "contain",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))"
          }}
        />

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
              textShadow: "0 2px 6px rgba(0,0,0,0.3)"
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
              color: "#DDE7F6"
            }}
          >
            PageRank Explorer
          </p>
        </div>
      </div>

      {/* KEYWORD SEARCH CARD */}
      <section>
        <div
          style={{
            background: "linear-gradient(145deg, #0065BD 0%, #0B2A4A 70%)",
            borderRadius: 18,
            padding: "1rem 1.05rem 1.1rem",
            boxShadow: "0 18px 40px rgba(2,16,31,0.9)",
            border: "1px solid rgba(152,198,234,0.45)"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.05rem",
              color: "#E5F0FF"
            }}
          >
            Keyword Search
          </h2>
          <p
            style={{
              margin: "0.35rem 0 0.75rem",
              fontSize: "0.85rem",
              color: "#DBEAFE"
            }}
          >
            Enter keywords to search the TUM website graph and jump to relevant
            pages.
          </p>

          <form
            onSubmit={handleKeywordSearch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <input
              type="text"
              placeholder="e.g. quantum computing, enrollment, AI lab..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 1,
                padding: "0.55rem 0.8rem",
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.95)",
                background: "rgba(15,23,42,0.96)",
                color: "#F9FAFB",
                fontSize: "0.85rem",
                boxShadow: "0 0 0 1px rgba(15,23,42,0.7) inset"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: 999,
                border: "none",
                background: "#0065BD",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(0,32,80,0.7)",
                whiteSpace: "nowrap"
              }}
            >
              Search
            </button>
          </form>

          <div style={{ marginTop: "0.9rem" }}>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#E5F0FF",
                marginBottom: "0.15rem"
              }}
            >
              Results
            </div>
            {!hasQuery && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#C7D2FE",
                  marginBottom: "0.3rem"
                }}
              >
                Latest indexed results (highest PageRank pages):
              </div>
            )}

            <div
              className="link-list-scroll"
              style={{
                maxHeight: 230,
                overflowY: "auto",
                paddingRight: 4,
                marginTop: visibleResults.length ? 4 : 0
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
                        "0 10px 24px rgba(2,10,24,0.9), 0 0 0 1px rgba(7,26,57,0.9) inset"
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

                    {/* CLICKABLE URL ADDED HERE */}
                    <a
                      href={n.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: "0.76rem",
                        color: "#93C5FD",
                        textDecoration: "underline",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block"
                      }}
                    >
                      {n.id}
                    </a>

                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "#BFDBFE",
                        marginTop: 2
                      }}
                    >
                      PageRank:{" "}
                      <span style={{ color: "#FFCB05" }}>
                        {(n.pagerank ?? 0).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {visibleResults.length === 0 && searchError && (
                <div
                  style={{
                    marginTop: "0.35rem",
                    padding: "0.45rem 0.55rem",
                    borderRadius: 10,
                    background: "rgba(30,64,175,0.85)",
                    color: "#fee2e2",
                    fontSize: "0.78rem",
                    border: "1px solid rgba(248,113,113,0.7)"
                  }}
                >
                  {searchError}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STATUS + TOP NODES */}
      <section>
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "0.3rem",
            color: "#A8B3C4"
          }}
        >
          Status
        </h2>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#A8B3C4" }}>
          Nodes: {data.nodes.length} • Edges: {data.links.length}
        </p>
        <p
          style={{
            margin: "0.15rem 0 0",
            fontSize: "0.8rem"
          }}
        >
          Hover a node to see its title and PageRank. Drag to explore, scroll to
          zoom.
        </p>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.8rem",
            color: "#9DA7B6",
            lineHeight: 1.4
          }}
        >
          • Larger nodes represent higher PageRank scores.
          <br />
          • Color encodes PageRank (sky blue → TUM blue → yellow).
          <br />
          • Hover a node to highlight it and its neighbors; others fade.
        </p>

        <div style={{ marginTop: "0.6rem" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#A8B3C4"
            }}
          >
            Top pages
          </h3>
          <ul
            style={{
              listStyle: "none",
              margin: "0.3rem 0 0",
              padding: 0,
              fontSize: "0.8rem"
            }}
          >
            {topNodes.map((n, idx) => (
              <li key={n.id} style={{ marginBottom: 2 }}>
                {idx + 1}. {n.title || n.id}{" "}
                <span style={{ color: "#9DA7B6" }}>
                  ({(n.pagerank ?? 0).toFixed(4)})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
