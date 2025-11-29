import argparse
import json
import sys
import time
from collections import deque
from urllib import robotparser
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


def fallback_title(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return parsed.netloc or url
    last = path.split("/")[-1]
    return last.replace("-", " ").replace("_", " ").title()


def compute_pagerank(graph, damping=0.85, tol=1e-6, max_iter=200):
    nodes = list(graph.keys())
    n = len(nodes)
    if n == 0:
        return {}
    idx = {u: i for i, u in enumerate(nodes)}
    outdeg = [len(graph.get(u, [])) for u in nodes]
    pr = [1.0 / n] * n

    for _ in range(max_iter):
        nxt = [(1 - damping) / n] * n
        for u_idx, u in enumerate(nodes):
            targets = graph.get(u, [])
            if not targets:
                share = damping * pr[u_idx] / n
                for j in range(n):
                    nxt[j] += share
            else:
                share = damping * pr[u_idx] / max(outdeg[u_idx], 1)
                for v in targets:
                    if v not in idx:
                        continue
                    nxt[idx[v]] += share
        delta = sum(abs(nxt[i] - pr[i]) for i in range(n))
        pr = nxt
        if delta < tol:
            break

    return {nodes[i]: pr[i] for i in range(n)}


class Crawler:
    def __init__(self, base_url, delay=1.0, max_pages=30):
        self.base_url = base_url.rstrip("/")
        self.visited = set()
        self.delay = delay
        self.graph = {}
        self.titles = {}
        self.max_pages = max_pages
        self.rp = robotparser.RobotFileParser()
        self.rp.set_url(urljoin(self.base_url, "/robots.txt"))
        try:
            self.rp.read()
        except Exception:
            pass

    def is_valid(self, url):
        # Only crawl URLs that stay within the cit.tum.de domain and limit subdomain depth to 2
        parsed = urlparse(url)
        host = parsed.netloc
        if not host.endswith("cit.tum.de"):
            return False
        parts = host.split(".")
        if "cit" in parts:
            cit_index = parts.index("cit")
            subdomain_depth = cit_index
            if subdomain_depth > 2:
                return False
        if hasattr(self, "rp") and not self.rp.can_fetch("*", url):
            return False
        path_segments = [p for p in parsed.path.split("/") if p]
        if len(path_segments) > 3:
            return False
        return True

    def fetch(self, url):
        try:
            time.sleep(self.delay)
            resp = requests.get(url, timeout=10)
            ctype = resp.headers.get("Content-Type", "")
            if "text/html" not in ctype:
                return None
            if resp.status_code == 200:
                return resp.text
        except Exception:
            return None
        return None

    def parse_links(self, html, current_url):
        try:
            soup = BeautifulSoup(html, "html.parser")
        except Exception:
            return set()
        links = set()
        for a in soup.find_all("a", href=True):
            url = urljoin(current_url, a["href"])
            if self.is_valid(url):
                links.add(url.split("#")[0])
        return links

    def extract_title(self, html, url):
        try:
            soup = BeautifulSoup(html, "html.parser")
            t = soup.find("title")
            if t and t.string:
                title = t.string.strip()
                if title:
                    return title[:180]
        except Exception:
            pass
        return fallback_title(url)

    def crawl(self, url=None):
        queue = deque()
        queue.append(url or self.base_url)

        while queue and len(self.visited) < self.max_pages:
            current = queue.popleft()
            if current in self.visited:
                continue
            if not self.is_valid(current):
                continue

            self.visited.add(current)
            html = self.fetch(current)
            if not html:
                self.titles[current] = fallback_title(current)
                self.graph[current] = []
                continue

            self.titles[current] = self.extract_title(html, current)
            links = self.parse_links(html, current)
            self.graph[current] = list(links)

            for link in links:
                if link not in self.visited and self.is_valid(link):
                    queue.append(link)

    def as_graph_payload(self, start_url, elapsed):
        # Ensure all link targets exist as nodes (dangling targets get empty out-links)
        graph = {k: list(v) for k, v in self.graph.items()}
        for targets in list(graph.values()):
            for dst in targets:
                if dst not in graph:
                    graph[dst] = []

        pr = compute_pagerank(graph)
        nodes = []
        for url in graph.keys():
            nodes.append(
                {
                    "id": url,
                    "title": self.titles.get(url, fallback_title(url)),
                    "pagerank": pr.get(url, 0.0),
                }
            )
        links = []
        for src, targets in graph.items():
            for dst in targets:
                links.append({"source": src, "target": dst})

        return {
            "graph": graph,
            "titles": self.titles,
            "pagerank": pr,
            "nodes": nodes,
            "links": links,
            "crawl_info": {
                "start_url": start_url,
                "pages_crawled": len(self.graph),
                "max_pages": self.max_pages,
                "delay": self.delay,
                "domain": urlparse(start_url).netloc,
                "total_time": round(elapsed, 2),
            },
        }


def main():
    parser = argparse.ArgumentParser(description="Simple CIT crawler with PageRank output")
    parser.add_argument("start_url")
    parser.add_argument("--delay", type=float, default=1.0)
    parser.add_argument("--max-pages", type=int, default=30)
    args = parser.parse_args()

    start = time.time()
    crawler = Crawler(args.start_url, delay=args.delay, max_pages=args.max_pages)
    crawler.crawl()
    elapsed = time.time() - start

    payload = crawler.as_graph_payload(args.start_url, elapsed)
    json.dump(payload, sys.stdout, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
