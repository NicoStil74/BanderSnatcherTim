// src/components/GraphCard.jsx
import React from "react";
import ForceGraph2D from "react-force-graph-2d";

function GraphCard({
  graphData,
  graphRef,
  hoverNode,
  setHoverNode,
  selectedNode,
  setSelectedNode,
  focusOnNode,
  isNodeHighlighted,
  isLinkHighlighted,
  getNodeBaseColor
}) {
  return (
    <section className="card graph-card">
      <div className="graph-wrapper">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          backgroundColor="#050827"
          nodeRelSize={6}
          nodeVal={(node) => 4 + (node.pagerank || 0) * 200}
          onNodeHover={(node) => setHoverNode(node || null)}
          onNodeClick={(node) => {
            setSelectedNode(node);
            setHoverNode(node);
            focusOnNode(node);
          }}
          nodeLabel={(node) =>
            `${node.title || node.id}\nPageRank: ${
              node.pagerank != null
                ? Number(node.pagerank).toFixed(4)
                : "unknown"
            }`
          }
          nodeColor={(node) => {
            const base = getNodeBaseColor(node);
            if (selectedNode && selectedNode.id === node.id) {
              return "#FFCB05";
            }
            if (!hoverNode) return base;
            return isNodeHighlighted(node)
              ? base
              : "rgba(148,163,184,0.25)";
          }}
          linkColor={(link) => {
            if (!hoverNode) return "rgba(148,163,184,0.35)";
            return isLinkHighlighted(link)
              ? "rgba(255,203,5,0.9)"
              : "rgba(148,163,184,0.08)";
          }}
          linkWidth={(link) => (isLinkHighlighted(link) ? 2 : 0.7)}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={(link) =>
            isLinkHighlighted(link) ? 2 : 0
          }
          cooldownTicks={150}
          onEngineStop={() => {
            if (graphRef.current) {
              graphRef.current.zoomToFit(400, 40);
            }
          }}
        />
      </div>
    </section>
  );
}

export default GraphCard;
