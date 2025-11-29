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

    def is_valid(self, url):
        # Only crawl URLs that stay within the cit.tum.de domain
        parsed = urlparse(url)
        return parsed.netloc.endswith("cit.tum.de")

    def fetch(self, url):
        try:
            time.sleep(self.delay)
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                return resp.text
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
        return None

    def parse_links(self, html, current_url):
        soup = BeautifulSoup(html, 'html.parser')
        links = set()
        for a in soup.find_all('a', href=True):
            url = urljoin(current_url, a['href'])
            if self.is_valid(url):
                links.add(url.split('#')[0])
        return links

    def crawl(self, url=None):
        if url is None:
            url = self.base_url

        if url in self.visited:
            return

        print(f"Crawling: {url}")
        self.visited.add(url)

        html = self.fetch(url)
        if not html:
            return

        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        self.data[url] = text

        for link in self.parse_links(html, url):
            self.crawl(link)

    def save(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    crawler = Crawler("https://www.cit.tum.de", delay=1.0)
    crawler.crawl()
    crawler.save("cit_tum_content.json")
    print("Saved to cit_tum_content.json")
