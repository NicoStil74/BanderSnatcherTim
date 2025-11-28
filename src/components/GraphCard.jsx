// src/components/GraphCard.jsx
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

                       // 🔽 NEW: crawl controls
                       siteUrl,
                       setSiteUrl,
                       loading,
                       crawlError,
                       onCrawl
                   }) {
    const handleNodeHover = useCallback(
        (node) => {
            if ((!node && !hoverNode) || (node && hoverNode && node.id === hoverNode.id)) {
                return;
            }
            setHoverNode(node || null);
        },
        [hoverNode, setHoverNode]
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
            {/* 🔽 crawl bar at top */}
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
                    onNodeClick={(node) => {
                        setSelectedNode(node);
                        setHoverNode(node);
                        focusOnNode(node);
                    }}
                    nodeLabel={(node) =>
                        `${node.title || node.id}\nPageRank: ${
                            node.pagerank != null ? Number(node.pagerank).toFixed(4) : "unknown"
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
                            : "rgba(148,163,184,0.1)";
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
