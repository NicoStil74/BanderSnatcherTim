import React, { useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import CrawlerControls from "./CrawlerControls";

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
    getNodeBaseColor,
    siteUrl,
    setSiteUrl,
    loading,
    crawlError,
    onCrawl
}) {
    const handleNodeHover = useCallback(
        (node) => {
            if (selectedNode) return; // if clicked, do NOT override highlight
            setHoverNode(node || null);
        },
        [selectedNode, setHoverNode]
    );

    useEffect(() => {
        if (graphRef.current) {
            const fg = graphRef.current;
            fg.d3Force("charge").strength(-800);
            fg.d3ReheatSimulation();
        }
    }, [graphData, graphRef]);

    return (
        <section className="card graph-card">
            <CrawlerControls
                siteUrl={siteUrl}
                setSiteUrl={setSiteUrl}
                loading={loading}
                error={crawlError}
                onCrawl={onCrawl}
            />

            <div
                className="graph-wrapper"
                style={{ cursor: hoverNode ? "pointer" : "default" }}
            >
                <ForceGraph2D
                    ref={graphRef}
                    backgroundColor="#050827"
                    graphData={graphData}
                    linkDistance={150}
                    cooldownTicks={100}
                    nodeRelSize={6}
                    nodeVal={(node) => 4 + (node.pagerank || 0) * 200}
                    onNodeHover={handleNodeHover}
                    onNodeClick={(node, event) => {
                      // ⭐ CMD/CTRL + Click → Open link in new tab
                      if (event.metaKey || event.ctrlKey) {
                          if (node.id && typeof node.id === "string") {
                              window.open(node.id, "_blank", "noopener,noreferrer");
                          }
                          return; // do NOT select node
                      }
                  
                      // ⭐ Normal click → highlight/persist  
                      setSelectedNode(node);
                      setHoverNode(null);
                  }}
                    onBackgroundClick={() => {
                        setSelectedNode(null);
                        setHoverNode(null);
                    }}
                    nodeLabel={(node) =>
                        `${node.title || node.id}\nPageRank: ${
                            node.pagerank != null ? Number(node.pagerank).toFixed(4) : "unknown"
                        }`
                    }
                    nodeColor={(node) => {
                      const base = getNodeBaseColor(node);
                  
                      // ⭐ BASE CASE: no hover, no selection → show nodes normally
                      if (!hoverNode && !selectedNode) return base;
                  
                      // Highlighted nodes (neighbors of hover/selected)
                      if (isNodeHighlighted(node)) return base;
                  
                      // Dim everything else
                      return "rgba(148,163,184,0.1)";
                  }}
                    linkColor={(link) => {
                      const highlighted = isLinkHighlighted(link);
                  
                      // ⭐ No hover + no selection → show all edges
                      if (!hoverNode && !selectedNode) {
                          return "rgba(148,163,184,0.1)";
                      }
                  
                      return highlighted
                          ? "rgba(255,203,5,0.8)"
                          : "rgba(148,163,184,0.05)";
                  }}
                  
                    linkWidth={(link) =>
                        isLinkHighlighted(link) ? 2 : 1
                    }
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
