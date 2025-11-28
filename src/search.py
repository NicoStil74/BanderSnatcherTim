import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import time

class Crawler:
    def __init__(self, base_url, delay=1.0):
        self.base_url = base_url.rstrip('/')
        self.visited = set()
        self.delay = delay
        self.data = {}
        # robots.txt parser
        from urllib import robotparser
        self.rp = robotparser.RobotFileParser()
        self.rp.set_url(urljoin(self.base_url, '/robots.txt'))
        try:
            self.rp.read()
        except:
            pass

    def is_valid(self, url):
        # Only crawl URLs that stay within the cit.tum.de domain and limit subdomain depth to 2
        parsed = urlparse(url)
        host = parsed.netloc
        if not host.endswith("cit.tum.de"):
            return False
        parts = host.split('.')
        if "cit" in parts:
            cit_index = parts.index("cit")
            subdomain_depth = cit_index
            if subdomain_depth > 2:
                return False
        # robots.txt check
        if hasattr(self, 'rp') and not self.rp.can_fetch('*', url):
            return False
        # Limit path depth to /xx/yy/zz (max 3 segments)
        path_segments = [p for p in parsed.path.split('/') if p]
        if len(path_segments) > 3:
            return False
        return True

    def fetch(self, url):
        try:
            time.sleep(self.delay)
            resp = requests.get(url, timeout=10)
            # Skip non-HTML content (e.g., images, PDFs)
            ctype = resp.headers.get('Content-Type', '')
            if 'text/html' not in ctype:
                print(f"Skipping non-HTML content: {url}")
                return None
            if resp.status_code == 200:
                return resp.text
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
        return None

    def parse_links(self, html, current_url):
        # Ensure HTML is parseable
        try:
            soup = BeautifulSoup(html, 'html.parser')
        except Exception:
            print(f"Parser rejected markup, skipping: {url}")
            return
        links = set()
        for a in soup.find_all('a', href=True):
            url = urljoin(current_url, a['href'])
            if self.is_valid(url):
                links.add(url.split('#')[0])
        return links

    def crawl(self, url=None):
        # BFS for speed
        from collections import deque
        queue = deque()
        queue.append(url or self.base_url)

        while queue:
            current = queue.popleft()
            if current in self.visited:
                continue
            if not self.is_valid(current):
                continue

            print(f"Crawling: {current}")
            self.visited.add(current)

            html = self.fetch(current)
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')
            text = soup.get_text(separator=' ', strip=True)
            self.data[current] = text

            links = self.parse_links(html, current)
            if links:
                for link in links:
                    if link not in self.visited and self.is_valid(link):
                        queue.append(link)

    def save(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    crawler = Crawler("https://www.cit.tum.de", delay=1.0)
    crawler.crawl()
    crawler.save("cit_tum_content.json")
    print("Saved to cit_tum_content.json")
