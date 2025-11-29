// src/components/LinkNeighborhood.jsx
import React from "react";

function LinkNeighborhood({
  selectedNode,
  inDegree,
  outDegree,
  selectedIncoming,
  selectedOutgoing
}) {
  return (
    <section
      className="card results-card"
      style={{ maxWidth: 480, alignSelf: "start", width: "100%" }}
    >
      <h2>Link neighborhood</h2>

      {!selectedNode ? (
        <p className="muted">
          No page selected yet. Use the keyword search on the left or click a
          node in the visualization to see its incoming and outgoing links
          here.
        </p>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: "0.6rem" }}>
            In: <strong>{inDegree.get(selectedNode.id) ?? 0}</strong> • Out:{" "}
            <strong>{outDegree.get(selectedNode.id) ?? 0}</strong>
          </p>

          {/* Selected node info */}
          <div
            style={{
              borderRadius: "0.85rem",
              border: "1px solid rgba(55,65,81,0.95)",
              background: "rgba(7,26,47,0.96)",
              padding: "0.8rem 0.95rem 0.9rem",
              marginBottom: "0.9rem"
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: "0.2rem"
              }}
            >
              <strong>{selectedNode.title || selectedNode.id}</strong>
            </div>
            <div
              style={{
                color: "#A8B3C4",
                fontSize: "0.8rem",
                overflowWrap: "anywhere"
              }}
            >
              {selectedNode.id}
            </div>
            <div style={{ marginTop: 6, fontSize: "0.8rem" }}>
              PageRank:{" "}
              <span style={{ color: "#FFCB05" }}>
                {(selectedNode.pagerank ?? 0).toFixed(6)}
              </span>
            </div>
          </div>

          {/* Incoming then outgoing, stacked and tighter */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            {/* Incoming */}
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(30,64,175,0.65)",
                background: "rgba(6,19,40,0.96)",
                padding: "0.55rem 0.7rem 0.65rem",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#A8B3C4",
                  marginBottom: 4
                }}
              >
                Incoming ({selectedIncoming.length})
              </div>
              <div
                className="link-list-scroll"
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  paddingRight: 4
                }}
              >
                {selectedIncoming.length === 0 ? (
                  <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>
                    None
                  </span>
                ) : (
                  selectedIncoming.map((id) => (
                    <a
                      key={id}
                      href={id}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        padding: "0.3rem 0.7rem",
                        borderRadius: 12,
                        background: "#0065BD",
                        marginBottom: 4,
                        fontSize: "0.78rem",
                        lineHeight: 1.3,
                        overflowWrap: "anywhere",
                        boxShadow: "0 4px 10px rgba(0,32,80,0.5) inset",
                        color: "#E5F0FF",
                        textDecoration: "none"
                      }}
                    >
                      {id}
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* Outgoing */}
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(0,101,189,0.65)",
                background: "rgba(5,22,43,0.96)",
                padding: "0.55rem 0.7rem 0.65rem",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#A8B3C4",
                  marginBottom: 4
                }}
              >
                Outgoing ({selectedOutgoing.length})
              </div>
              <div
                className="link-list-scroll"
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  paddingRight: 4
                }}
              >
                {selectedOutgoing.length === 0 ? (
                  <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>
                    None
                  </span>
                ) : (
                  selectedOutgoing.map((id) => (
                    <a
                      key={id}
                      href={id}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        padding: "0.3rem 0.7rem",
                        borderRadius: 12,
                        background: "#98C6EA",
                        color: "#02101F",
                        marginBottom: 4,
                        fontSize: "0.78rem",
                        lineHeight: 1.3,
                        overflowWrap: "anywhere",
                        boxShadow: "0 4px 10px rgba(0,32,80,0.35) inset",
                        textDecoration: "none"
                      }}
                    >
                      {id}
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default LinkNeighborhood;
