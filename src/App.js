import React, { useState, useMemo, useRef, useEffect } from "react";
import "./App.css";
import { buildForceGraphData, demoData } from "./graphUtils";
import Sidebar from "./components/Sidebar";
import useCrawler from "./hooks/useCrawler";
// ⛔️ removed CrawlerControls import – GraphCard uses it internally
import GraphCard from "./components/GraphCard";
import LinkNeighborhood from "./components/LinkNeighborhood";

function App() {
    const [data, setData] = useState(demoData);
    const [searchError, setSearchError] = useState("");

    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [keywordResults, setKeywordResults] = useState([]);

    const graphRef = useRef();

    // crawler hook
    const {
        siteUrl,
        setSiteUrl,
        loading: loadingCrawl,
        error: crawlError,
        crawlResult,
        runCrawl
    } = useCrawler("https://www.tum.de");

    // when new crawl data arrives, rebuild graph
    useEffect(() => {
        if (!crawlResult) return;

        try {
            const built = buildForceGraphData(crawlResult.graph);

            // apply titles
            if (crawlResult.titles) {
                built.nodes.forEach((n) => {
                    if (crawlResult.titles[n.id]) {
                        n.title = crawlResult.titles[n.id];
                    }
                });
            }

            // remove old positional fields so physics runs
            built.nodes.forEach((n) => {
                delete n.x;
                delete n.y;
                delete n.vx;
                delete n.vy;
            });

            built.links.forEach((l) => {
                if (typeof l.source === "object") {
                    delete l.source.x;
                    delete l.source.y;
                    delete l.source.vx;
                    delete l.source.vy;
                }
                if (typeof l.target === "object") {
                    delete l.target.x;
                    delete l.target.y;
                    delete l.target.vx;
                    delete l.target.vy;
                }
            });

            // *** FIX: remove embedded node objects from links ***
            built.links = built.links.map((l) => ({
                source: typeof l.source === "object" ? l.source.id : l.source,
                target: typeof l.target === "object" ? l.target.id : l.target
            }));

            setData(built);
        } catch (e) {
            console.error("Error building graph from crawlResult, using demo graph", e);
            setData(demoData);
        }
    }, [crawlResult]);

    // auto-crawl on mount
    useEffect(() => {
        runCrawl();
    }, [runCrawl]);

    // Compute neighbors, degrees, sorted nodes, and LIMIT EDGES
    const {
        graphData,
        neighbors,
        sortedNodes,
        maxPR,
        minPR,
        inDegree,
        outDegree,
        incoming,
        outgoing
    } = useMemo(() => {
        const MAX_EDGES = 400;

        // limit links
        const limitedLinks = data.links.slice(0, MAX_EDGES);

        // keep only nodes referenced by those links
        const visibleNodeIds = new Set();
        limitedLinks.forEach((l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            visibleNodeIds.add(src);
            visibleNodeIds.add(tgt);
        });

        const visibleNodes = data.nodes.filter((n) => visibleNodeIds.has(n.id));

        const neighbors = new Map();
        const inDegree = new Map();
        const outDegree = new Map();
        const incoming = new Map();
        const outgoing = new Map();

        let maxPR = -Infinity;
        let minPR = Infinity;

        visibleNodes.forEach((n) => {
            neighbors.set(n.id, new Set());
            inDegree.set(n.id, 0);
            outDegree.set(n.id, 0);
            incoming.set(n.id, new Set());
            outgoing.set(n.id, new Set());

            const pr = n.pagerank ?? 0;
            if (pr > maxPR) maxPR = pr;
            if (pr < minPR) minPR = pr;
        });

        limitedLinks.forEach((l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;

            if (!neighbors.has(src) || !neighbors.has(tgt)) return;

            neighbors.get(src).add(tgt);
            neighbors.get(tgt).add(src);

            inDegree.set(tgt, inDegree.get(tgt) + 1);
            outDegree.set(src, outDegree.get(src) + 1);

            incoming.get(tgt).add(src);
            outgoing.get(src).add(tgt);
        });

        if (!isFinite(maxPR)) maxPR = 0.0001;
        if (!isFinite(minPR)) minPR = 0;

        const sortedNodes = [...visibleNodes].sort(
            (a, b) => (b.pagerank ?? 0) - (a.pagerank ?? 0)
        );

        // final clean graph for the ForceGraph
        const graphData = {
            nodes: visibleNodes.map((n) => ({ ...n })),
            links: limitedLinks.map((l) => ({
                source: typeof l.source === "object" ? l.source.id : l.source,
                target: typeof l.target === "object" ? l.target.id : l.target
            }))
        };

        return {
            graphData,
            neighbors,
            sortedNodes,
            maxPR,
            minPR,
            inDegree,
            outDegree,
            incoming,
            outgoing
        };
    }, [data]);

    const focusOnNode = (node) => {
        if (!node || !graphRef.current) return;
        if (typeof node.x !== "number" || typeof node.y !== "number") return;
        graphRef.current.centerAt(node.x, node.y, 600);
        graphRef.current.zoom(4, 600);
    };

    // Keyword search
    const handleKeywordSearch = (e) => {
        e.preventDefault();
        const q = keyword.trim().toLowerCase();

        if (!q) {
            setKeywordResults([]);
            setSearchError("");
            return;
        }

        const matches = graphData.nodes
            .filter((n) => {
                const title = (n.title || "").toLowerCase();
                const id = (n.id || "").toLowerCase();
                return title.includes(q) || id.includes(q);
            })
            .sort((a, b) => (b.pagerank ?? 0) - (a.pagerank ?? 0));

        if (matches.length === 0) {
            setKeywordResults([]);
            setSearchError(`No pages found for "${keyword}".`);
            return;
        }

        setKeywordResults(matches.slice(0, 20));
        setSearchError("");
    };

    const handleResultClick = (node) => {
        setSelectedNode(node);
        setHoverNode(node);
        focusOnNode(node);
    };

    const isNodeHighlighted = (node) => {
        if (!hoverNode) return false;
        if (hoverNode.id === node.id) return true;
        const neigh = neighbors.get(hoverNode.id);
        return neigh?.has(node.id);
    };

    const isLinkHighlighted = (link) => {
        if (!hoverNode) return false;
        const src = link.source.id ?? link.source;
        const tgt = link.target.id ?? link.target;
        return src === hoverNode.id || tgt === hoverNode.id;
    };

    const getNodeBaseColor = (node) => {
        const pr = node.pagerank ?? 0;
        if (maxPR === minPR) return "rgb(152,198,234)";

        let t = (pr - minPR) / (maxPR - minPR + 1e-12);
        t = Math.max(0, Math.min(1, t));

        const sky = [152, 198, 234];
        const blue = [0, 101, 189];
        const gold = [255, 203, 5];

        const t2 = Math.pow(t, 0.55);
        const segA = t2 < 0.65;

        const a = segA ? sky : blue;
        const b = segA ? blue : gold;
        const r = segA ? t2 / 0.65 : (t2 - 0.65) / 0.35;

        const mix = (u, v) => Math.round(u * (1 - r) + v * r);
        const R = mix(a[0], b[0]);
        const G = mix(a[1], b[1]);
        const B = mix(a[2], b[2]);

        return `rgb(${R}, ${G}, ${B})`;
    };

    const topNodes = sortedNodes.slice(0, 5);

    const selectedIncoming = selectedNode
        ? Array.from(incoming.get(selectedNode.id) ?? [])
        : [];
    const selectedOutgoing = selectedNode
        ? Array.from(outgoing.get(selectedNode.id) ?? [])
        : [];

    const hasQuery = keyword.trim().length > 0;
    const visibleResults =
        hasQuery && keywordResults.length > 0
            ? keywordResults
            : !hasQuery
                ? sortedNodes.slice(0, 10)
                : [];

    return (
        <div className="app">
            <Sidebar
                data={graphData}
                keyword={keyword}
                setKeyword={setKeyword}
                hasQuery={hasQuery}
                visibleResults={visibleResults}
                searchError={searchError}
                handleKeywordSearch={handleKeywordSearch}
                handleResultClick={handleResultClick}
                topNodes={topNodes}
            />

            <main className="main">
                {/* 🔽 Graph card (left side of grid) */}
                <GraphCard
                    graphData={graphData}
                    graphRef={graphRef}
                    hoverNode={hoverNode}
                    setHoverNode={setHoverNode}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    focusOnNode={focusOnNode}
                    isNodeHighlighted={isNodeHighlighted}
                    isLinkHighlighted={isLinkHighlighted}
                    getNodeBaseColor={getNodeBaseColor}
                    // 🔽 pass crawl controls to GraphCard (which renders CrawlerControls)
                    siteUrl={siteUrl}
                    setSiteUrl={setSiteUrl}
                    loading={loadingCrawl}
                    crawlError={crawlError}
                    onCrawl={runCrawl}
                />

                {/* 🔽 Right-hand panel (neighbors) */}
                <LinkNeighborhood
                    selectedNode={selectedNode}
                    inDegree={inDegree}
                    outDegree={outDegree}
                    selectedIncoming={selectedIncoming}
                    selectedOutgoing={selectedOutgoing}
                />
            </main>
        </div>
    );
}

export default App;
