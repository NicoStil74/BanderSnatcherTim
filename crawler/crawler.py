#!/usr/bin/env python3
import asyncio
import aiohttp
import logging
import json
import os
import time
import argparse
from urllib.parse import urljoin, urlparse, urlunparse
from typing import Optional

from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("crawler")

DEFAULT_MAX_PAGES = int(os.environ.get("MAX_PAGES", 50))
DEFAULT_MAX_DEPTH = int(os.environ.get("MAX_DEPTH", 3))
DEFAULT_DELAY = float(os.environ.get("CRAWL_DELAY", 0.0))
DEFAULT_CONCURRENCY = int(os.environ.get("CONCURRENCY", 20))
DEFAULT_RETRIES = int(os.environ.get("MAX_RETRIES", 3))

SKIP_PREFIXES = ("mailto:", "tel:", "javascript:", "#", "data:")
SKIP_EXTENSIONS = (
    ".pdf", ".jpg", ".png", ".jpeg", ".svg", ".gif", ".zip",
    ".doc", ".docx", ".xlsx", ".xls", ".pptx", ".ppt", ".ics",
    ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".css", ".js"
)

def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    scheme = parsed.scheme.lower() or "https"
    netloc = parsed.netloc.lower()
    path = parsed.path.rstrip("/") or "/"
    return urlunparse((scheme, netloc, path, "", "", ""))

def is_same_domain(url: str, domain: str) -> bool:
    if not url:
        return False
    parsed = urlparse(url)
    url_domain = parsed.netloc.lower().replace("www.", "")
    target_domain = domain.lower().replace("www.", "")
    return bool(url_domain) and url_domain == target_domain

def is_valid_url(url: str, domain: str) -> bool:
    if not url:
        return False

    for prefix in SKIP_PREFIXES:
        if url.startswith(prefix):
            return False

    lower = url.lower()
    for ext in SKIP_EXTENSIONS:
        if lower.endswith(ext):
            return False

    return is_same_domain(url, domain)

def fallback_title_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return parsed.netloc
    last = path.split("/")[-1]
    return last.replace("-", " ").replace("_", " ").title()

async def fetch_page(
    session: aiohttp.ClientSession,
    url: str,
    retries: int = DEFAULT_RETRIES
) -> Optional[str]:
    for attempt in range(retries):
        try:
            async with session.get(
                url,
                timeout=aiohttp.ClientTimeout(total=12)
            ) as resp:
                if resp.status != 200:
                    return None

                content_type = resp.headers.get("Content-Type", "")
                if "text/html" not in content_type:
                    return None

                return await resp.text()
        except Exception:
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt)

    return None

def extract_links(html: str, base_url: str, domain: str) -> set:
    soup = BeautifulSoup(html, "html.parser")
    links = set()

    for a in soup.select("a[href]"):
        href = a.get("href") or ""
        if not href:
            continue

        absolute = urljoin(base_url, href)
        normalized = normalize_url(absolute)

        if is_valid_url(normalized, domain):
            links.add(normalized)

    return links

async def crawl_site(
    start_url: str,
    max_pages: int = DEFAULT_MAX_PAGES,
    max_depth: int = DEFAULT_MAX_DEPTH,
    keyword_filter: str = "",
    delay: float = DEFAULT_DELAY,
    concurrency: int = DEFAULT_CONCURRENCY,
) -> dict:
    start_time = time.time()
    start_url = normalize_url(start_url)
    domain = urlparse(start_url).netloc
    keyword = keyword_filter.lower().strip()

    visited = set()
    seen = set([start_url])
    queue: asyncio.Queue = asyncio.Queue()
    queue.put_nowait((start_url, 0))

    graph = {}
    titles = {}

    connector = aiohttp.TCPConnector(
        limit=max(concurrency * 2, 20),
        limit_per_host=concurrency,
        ttl_dns_cache=300,
    )
    headers = {"User-Agent": "Mozilla/5.0 (compatible; TUMSearchCrawler/1.0)"}

    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        async def worker():
            while True:
                item = await queue.get()
                if item is None:
                    queue.task_done()
                    break

                url, depth = item

                if url in visited or depth > max_depth or len(visited) >= max_pages:
                    queue.task_done()
                    continue

                if delay:
                    await asyncio.sleep(delay)

                html = await fetch_page(session, url)
                visited.add(url)

                title = fallback_title_from_url(url)
                titles[url] = title
                graph[url] = []

                if html:
                    if keyword and (keyword not in html.lower() and keyword not in url.lower()):
                        queue.task_done()
                        continue

                    links = extract_links(html, url, domain)
                    graph[url] = list(links)

                    next_depth = depth + 1
                    if next_depth <= max_depth:
                        for link in links:
                            if link in visited or link in seen or len(seen) >= max_pages:
                                continue
                            seen.add(link)
                            queue.put_nowait((link, next_depth))

                queue.task_done()

        workers = [asyncio.create_task(worker()) for _ in range(concurrency)]
        await queue.join()
        for _ in workers:
            queue.put_nowait(None)
        await asyncio.gather(*workers, return_exceptions=True)

    elapsed = time.time() - start_time

    return {
        "graph": graph,
        "titles": titles,
        "crawl_info": {
            "start_url": start_url,
            "domain": domain,
            "max_pages": max_pages,
            "pages_crawled": len(graph),
            "max_depth": max_depth,
            "keyword_filter": keyword or None,
            "delay": delay,
            "concurrency": concurrency,
            "total_time": round(elapsed, 2),
        },
    }

def parse_args():
    parser = argparse.ArgumentParser(description="Async site crawler")
    parser.add_argument("start_url")
    parser.add_argument("--max-pages", type=int, default=DEFAULT_MAX_PAGES)
    parser.add_argument("--max-depth", type=int, default=DEFAULT_MAX_DEPTH)
    parser.add_argument("--keyword", type=str, default="")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY)
    parser.add_argument("--concurrency", type=int, default=DEFAULT_CONCURRENCY)
    return parser.parse_args()

async def main_async(args):
    result = await crawl_site(
        start_url=args.start_url,
        max_pages=args.max_pages,
        max_depth=args.max_depth,
        keyword_filter=args.keyword,
        delay=args.delay,
        concurrency=args.concurrency,
    )
    print(json.dumps(result))

def main():
    args = parse_args()
    asyncio.run(main_async(args))

if __name__ == "__main__":
    main()
