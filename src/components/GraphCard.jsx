// src/components/GraphCard.jsx
import React, { useEffect, useCallback } from "react";
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

  // --- 1. MEMOIZE THE HOVER FUNCTION ---
  // This prevents the function from being recreated on every render,
  // which can interrupt the hover event stream.
  const handleNodeHover = useCallback((node) => {
    // Only update state if the node is different to prevent loops
    if ((!node && !hoverNode) || (node && hoverNode && node.id === hoverNode.id)) {
        return;
    }
    setHoverNode(node || null);
  }, [hoverNode, setHoverNode]);

  // --- 2. FORCE SIMULATION SETTINGS ---
  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;

      // Strong repulsion to fix the "clumping" issue
      fg.d3Force('charge').strength(-800);
      
      // Reheat the simulation so these forces apply immediately
      fg.d3ReheatSimulation();
    }
  }, [graphData, graphRef]);

  return (
    <section className="card graph-card">
      <div 
        className="graph-wrapper"
        // --- 3. ADD CURSOR FEEDBACK ---
        // This ensures you see a pointer when hovering a node
        style={{ cursor: hoverNode ? 'pointer' : 'default' }}
      >
        <ForceGraph2D
          ref={graphRef}
          backgroundColor="#050827"
          graphData={graphData}
          
          // Fixes the crowding
          linkDistance={150}
          
          // Allow physics to run long enough to unfold
          cooldownTicks={100}
          
          // --- VISUAL SETTINGS ---
          nodeRelSize={6}
          // Ensure radius is always positive and large enough to hit
          nodeVal={(node) => 4 + (node.pagerank || 0) * 200}
          
          // --- INTERACTION ---
          onNodeHover={handleNodeHover}
          onNodeClick={(node) => {
            setSelectedNode(node);
            setHoverNode(node); // Keep it highlighted after click
            focusOnNode(node);
          }}
          
          // --- LABELS & COLORS ---
          nodeLabel={(node) =>
            `${node.title || node.id}\nPageRank: ${
              node.pagerank != null
                ? Number(node.pagerank).toFixed(4)
                : "unknown"
            }`
          }
          
          nodeColor={(node) => {
            const base = getNodeBaseColor(node);
            
            // 1. If Selected (Clicked), show Gold
            if (selectedNode && selectedNode.id === node.id) {
              return "#FFCB05";
            }
            
            // 2. If Nothing Hovered, show Base Color
            if (!hoverNode) return base;
            
            // 3. If Hovered, highlight neighbors, fade others
            return isNodeHighlighted(node)
              ? base
              : "rgba(148,163,184,0.1)"; // Made fade darker for contrast
          }}
          
          linkColor={(link) => {
            if (!hoverNode) return "rgba(148,163,184,0.2)";
            return isLinkHighlighted(link)
              ? "rgba(255,203,5,0.8)"
              : "rgba(148,163,184,0.05)";
          }}
          
          linkWidth={(link) => (isLinkHighlighted(link) ? 2 : 1)}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link) =>
            isLinkHighlighted(link) ? 2.5 : 0
          }
          
          initialZoom={0.6}
        />
      </div>
    </section>
  );
}

export default GraphCard;