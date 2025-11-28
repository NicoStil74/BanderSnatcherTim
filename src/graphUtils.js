// src/graphUtils.js

export function computePageRank(adj, iterations = 30, damping = 0.85) {
  const nodes = Object.keys(adj);
  const N = nodes.length;
  const pr = {};
  const outDegree = {};

  nodes.forEach((n) => {
    pr[n] = 1 / N;
    outDegree[n] = (adj[n] && adj[n].length) || 0;
  });

  for (let it = 0; it < iterations; it++) {
    const next = {};
    nodes.forEach((n) => {
      next[n] = (1 - damping) / N;
    });

    nodes.forEach((u) => {
      const share = damping * pr[u];
      if (outDegree[u] === 0) {
        const add = share / N;
        nodes.forEach((v) => {
          next[v] += add;
        });
      } else {
        const add = share / outDegree[u];
        (adj[u] || []).forEach((v) => {
          next[v] += add;
        });
      }
    });

    Object.assign(pr, next);
  }

  return pr;
}

export function buildForceGraphData(adj) {
  const nodesMap = new Map();
  const links = [];
  const pr = computePageRank(adj);

  for (const [src, targets] of Object.entries(adj)) {
    if (!nodesMap.has(src)) {
      nodesMap.set(src, {
        id: src,
        title: src,
        pagerank: pr[src] || 0
      });
    }

    (targets || []).forEach((dst) => {
      if (!nodesMap.has(dst)) {
        nodesMap.set(dst, {
          id: dst,
          title: dst,
          pagerank: pr[dst] || 0
        });
      }
      links.push({ source: src, target: dst });
    });
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links
  };
}

// Fallback small demo graph
export const demoData = {
  nodes: [
    { id: "A", title: "Home", pagerank: 0.4 },
    { id: "B", title: "About", pagerank: 0.2 },
    { id: "C", title: "Contact", pagerank: 0.15 },
    { id: "D", title: "Blog", pagerank: 0.1 },
    { id: "E", title: "FAQ", pagerank: 0.08 }
  ],
  links: [
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "B", target: "D" },
    { source: "C", target: "D" },
    { source: "D", target: "E" },
    { source: "E", target: "A" }
  ]
};
