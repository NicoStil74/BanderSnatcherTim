import React, { useEffect, useCallback, useRef, useState } from "react";
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
    const lastFitKey = useRef(null);
    const wrapperRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const pointerRef = useRef({ active: false, x: 0, y: 0 });

    const handleNodeHover = useCallback(
        (node) => {
            if (!node) {
                setHoverNode(null);
                return;
            }

            if (!selectedNode) {
                setHoverNode(node);
            }
        },
        [selectedNode, setHoverNode]
    );

    useEffect(() => {
        if (graphRef.current) {
            const fg = graphRef.current;
            fg.d3Force("charge").strength(-800);
        }
    }, [graphData, graphRef]);

    // Track container size so the graph canvas matches its grid cell
    useEffect(() => {
        if (!wrapperRef.current) return;
        const measure = () => {
            const rect = wrapperRef.current.getBoundingClientRect();
            setDims({ w: rect.width, h: rect.height });
        };

        measure();

        let observer;
        if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(measure);
            observer.observe(wrapperRef.current);
        } else {
            window.addEventListener("resize", measure);
        }

        return () => {
            if (observer) observer.disconnect();
            else window.removeEventListener("resize", measure);
        };
    }, []);

    // Auto-fit once per dataset to keep graph centered but allow user zoom/pan
    useEffect(() => {
        if (
            !graphRef.current ||
            !graphData?.nodes?.length ||
            dims.w <= 0 ||
            dims.h <= 0
        )
            return;

        const key = `${graphData.nodes.length}-${graphData.links?.length || 0}-${dims.w}x${dims.h}-${loading ? "L" : "D"}`;
        if (lastFitKey.current === key) return;
        lastFitKey.current = key;

        const pad = loading
            ? Math.max(80, Math.min(dims.w, dims.h) * 0.3 || 160)
            : Math.max(100, Math.min(dims.w, dims.h) * 0.2 || 140);

        requestAnimationFrame(() => {
            if (graphRef.current) {
                graphRef.current.zoomToFit(700, pad);
            }
        });
    }, [graphData, graphRef, dims, loading]);

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
                ref={wrapperRef}
                className="graph-wrapper"
                style={{ cursor: hoverNode ? "pointer" : "default" }}
                onMouseMove={(e) => {
                    const fg = graphRef.current;
                    if (!fg) return;
                    const coords = fg.screen2GraphCoords(e.clientX, e.clientY);
                    pointerRef.current = {
                        active: true,
                        x: coords.x,
                        y: coords.y
                    };
                }}
                onMouseLeave={() => {
                    pointerRef.current = { active: false, x: 0, y: 0 };
                }}
            >
                <ForceGraph2D
                    ref={graphRef}
                    backgroundColor="#050827"
                    graphData={graphData}
                    width={dims.w > 0 ? dims.w : undefined}
                    height={dims.h > 0 ? dims.h : undefined}
                    linkDistance={150}
                    cooldownTicks={120}
                    nodeRelSize={loading ? 4 : 5}
                    nodeVal={(node) => {
                        const base = loading
                            ? 1.5 + (node.pagerank || 0) * 50
                            : 4 + (node.pagerank || 0) * 160;
                        const isHovered = hoverNode && hoverNode.id === node.id;
                        return isHovered ? base * 1.2 : base;
                    }}
                    onEngineTick={() => {
                        const fg = graphRef.current;
                        if (!fg || !pointerRef.current.active || !graphData?.nodes) return;
                        const { x: px, y: py } = pointerRef.current;
                        const radius = 160;
                        const radius2 = radius * radius;
                        const push = 0.02;

                        graphData.nodes.forEach((n) => {
                            if (typeof n.x !== "number" || typeof n.y !== "number") return;
                            const dx = n.x - px;
                            const dy = n.y - py;
                            const dist2 = dx * dx + dy * dy;
                            if (dist2 >= radius2 || dist2 === 0) return;
                            const dist = Math.sqrt(dist2);
                            const force = ((radius - dist) / radius) * push;
                            n.vx = (n.vx || 0) + (dx / dist) * force;
                            n.vy = (n.vy || 0) + (dy / dist) * force;
                        });
                    }}
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
                  
                      // During loading, keep colors but slightly toned down
                      if (loading && !hoverNode && !selectedNode) {
                          return base.replace("rgb", "rgba").replace(")", ",0.8)");
                      }
                  
                      // ⭐ BASE CASE: no hover, no selection → show nodes normally
                      if (!hoverNode && !selectedNode) return base;
                  
                      // Highlighted nodes (neighbors of hover/selected)
                      if (isNodeHighlighted(node)) return base;
                  
                      // Dim everything else
                      return "rgba(148,163,184,0.1)";
                  }}
                    linkColor={(link) => {
                      const highlighted = isLinkHighlighted(link);
                  
                      // ⭐ No hover + no selection → show all edges (slightly brighter)
                      if (!hoverNode && !selectedNode) {
                          return "rgba(148,163,184,0.22)";
                      }
                  
                      return highlighted
                          ? "rgba(255,203,5,0.8)"
                          : "rgba(148,163,184,0.12)";
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
