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
            <h2>Link Neighborhood</h2>

            {/* No node selected */}
            {!selectedNode ? (
                <p className="muted">
                    No page selected yet. Use the keyword search on the left or click a
                    node in the visualization to see its incoming and outgoing links.
                </p>
            ) : (
                <>
                    {/* Summary numbers */}
                    <p className="muted">
                        In-degree:{" "}
                        <strong>{inDegree.get(selectedNode.id) ?? 0}</strong> • Out-degree:{" "}
                        <strong>{outDegree.get(selectedNode.id) ?? 0}</strong>
                    </p>

                    {/* Selected node info box */}
                    <div
                        style={{
                            borderRadius: "0.85rem",
                            border: "1px solid rgba(55,65,81,0.95)",
                            background: "rgba(7,26,47,0.96)",
                            padding: "0.8rem 0.95rem 0.9rem",
                            marginBottom: "0.85rem"
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

                    {/* Incoming + Outgoing as 2-column grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                            alignItems: "stretch",
                            marginTop: "0.1rem"
                        }}
                    >
                        {/* Incoming */}
                        <div
                            style={{
                                borderRadius: 12,
                                border: "1px solid rgba(70,90,120,0.45)",
                                background: "rgba(10,20,35,0.85)",
                                padding: "0.75rem",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.8rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#A8B3C4",
                                    marginBottom: 8,
                                    opacity: 0.9
                                }}
                            >
                                Incoming ({selectedIncoming.length})
                            </div>

                            <div
                                className="link-list-scroll"
                                style={{
                                    maxHeight: 180,
                                    overflowY: "auto",
                                    paddingRight: 4
                                }}
                            >
                                {selectedIncoming.length === 0 ? (
                                    <div
                                        style={{
                                            padding: "0.45rem 0.65rem",
                                            borderRadius: 8,
                                            background: "rgba(15,23,42,0.9)",
                                            border: "1px dashed rgba(75,85,99,0.9)",
                                            fontSize: "0.78rem",
                                            color: "#6B7280",
                                            lineHeight: 1.35
                                        }}
                                    >
                                        None
                                    </div>
                                ) : (
                                    selectedIncoming.map((id) => (
                                        <div
                                            key={id}
                                            style={{
                                                padding: "0.45rem 0.65rem",
                                                borderRadius: 8,
                                                background: "rgba(0,101,189,0.15)",
                                                border: "1px solid rgba(0,101,189,0.25)",
                                                marginBottom: 6,
                                                fontSize: "0.78rem",
                                                color: "#D6E4F5",
                                                lineHeight: 1.35,
                                                overflowWrap: "anywhere"
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
                                borderRadius: 12,
                                border: "1px solid rgba(70,90,120,0.45)",
                                background: "rgba(10,20,35,0.85)",
                                padding: "0.75rem",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.8rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#A8B3C4",
                                    marginBottom: 8,
                                    opacity: 0.9
                                }}
                            >
                                Outgoing ({selectedOutgoing.length})
                            </div>

                            <div
                                className="link-list-scroll"
                                style={{
                                    maxHeight: 180,
                                    overflowY: "auto",
                                    paddingRight: 4
                                }}
                            >
                                {selectedOutgoing.length === 0 ? (
                                    <div
                                        style={{
                                            padding: "0.45rem 0.65rem",
                                            borderRadius: 8,
                                            background: "rgba(15,23,42,0.9)",
                                            border: "1px dashed rgba(75,85,99,0.9)",
                                            fontSize: "0.78rem",
                                            color: "#6B7280",
                                            lineHeight: 1.35
                                        }}
                                    >
                                        None
                                    </div>
                                ) : (
                                    selectedOutgoing.map((id) => (
                                        <div
                                            key={id}
                                            style={{
                                                padding: "0.45rem 0.65rem",
                                                borderRadius: 8,
                                                background: "rgba(152,198,234,0.15)",
                                                border: "1px solid rgba(152,198,234,0.25)",
                                                marginBottom: 6,
                                                fontSize: "0.78rem",
                                                color: "#D6E4F5",
                                                lineHeight: 1.35,
                                                overflowWrap: "anywhere"
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
