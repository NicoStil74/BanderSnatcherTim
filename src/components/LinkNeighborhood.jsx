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
    <section className="card results-card">
      <h2>Link neighborhood</h2>

      {!selectedNode ? (
        <p className="muted">
          No page selected yet. Use the keyword search on the left or click a
          node in the visualization to see its incoming and outgoing links
          here.
        </p>
      ) : (
        <>
          <p className="muted">
            In-degree:{" "}
            <strong>{inDegree.get(selectedNode.id) ?? 0}</strong> • Out-degree:{" "}
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

          {/* Incoming / outgoing columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "1rem"
            }}
          >
            {/* Incoming */}
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(30,64,175,0.7)",
                background: "rgba(6,19,40,0.97)",
                padding: "0.6rem 0.7rem 0.7rem",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#A8B3C4",
                  marginBottom: 6
                }}
              >
                Incoming ({selectedIncoming.length})
              </div>
              <div
                className="link-list-scroll"
                style={{
                  maxHeight: 176,
                  overflowY: "auto",
                  paddingRight: 6
                }}
              >
                {selectedIncoming.length === 0 ? (
                  <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>
                    None
                  </span>
                ) : (
                  selectedIncoming.map((id) => (
                    <div
                      key={id}
                      style={{
                        padding: "0.35rem 0.8rem",
                        borderRadius: 14,
                        background: "#0065BD",
                        marginBottom: 6,
                        fontSize: "0.78rem",
                        lineHeight: 1.35,
                        overflowWrap: "anywhere",
                        boxShadow: "0 6px 16px rgba(0,32,80,0.6) inset"
                      }}
                    >
                      {id}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Outgoing */}
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(0,101,189,0.7)",
                background: "rgba(5,22,43,0.97)",
                padding: "0.6rem 0.7rem 0.7rem",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#A8B3C4",
                  marginBottom: 6
                }}
              >
                Outgoing ({selectedOutgoing.length})
              </div>
              <div
                className="link-list-scroll"
                style={{
                  maxHeight: 176,
                  overflowY: "auto",
                  paddingRight: 6
                }}
              >
                {selectedOutgoing.length === 0 ? (
                  <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>
                    None
                  </span>
                ) : (
                  selectedOutgoing.map((id) => (
                    <div
                      key={id}
                      style={{
                        padding: "0.35rem 0.8rem",
                        borderRadius: 14,
                        background: "#98C6EA",
                        color: "#02101F",
                        marginBottom: 6,
                        fontSize: "0.78rem",
                        lineHeight: 1.35,
                        overflowWrap: "anywhere",
                        boxShadow: "0 6px 16px rgba(0,32,80,0.4) inset"
                      }}
                    >
                      {id}
                    </div>
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
