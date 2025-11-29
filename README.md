# TUMSearch – PageRank Explorer
### *Hackathon Project by Team Bandersnatchers*

TUMSearch is an interactive web application that crawls a website, constructs its internal link graph, computes PageRank across all discovered pages, and visualizes the network using an interactive force-directed graph interface.

It was created during the TUM Hackathon by **Team Bandersnatchers**.

---

## ⭐ **Features**

### 🔍 Website Crawler
- Crawls any website (supports subdomains)
- Uses asynchronous requests (aiohttp)
- Extracts internal hyperlinks
- Detects page titles
- Filters out non-HTML content (PDF, images, JS, CSS, etc.)

### 📊 PageRank Computation
- Builds a directed graph of hyperlinks
- Computes PageRank from the extracted graph
- Highlights high-authority pages

### 🎨 Interactive Visualization
- Node size = PageRank score  
- Node color = PageRank score (gradient blue → yellow)
- Hover to highlight and show metadata
- Click to explore incoming/outgoing links
- Smooth force-directed layout

### 🧭 Keyword Search
- Search discovered pages by title or URL
- Jump directly to nodes in the visualization

---

# 🧱 **Tech Stack**

### Frontend  
- React  
- react-force-graph-2d  
- CSS (custom styling)

### Backend  
- Node.js  
- Express  
- Child process integration with Python

### Crawler  
- Python 3  
- aiohttp  
- BeautifulSoup4  

---

# 📁 **Project Structure**

```
project/
│
├── server.js              # Node backend API
├── crawler/
│   └── crawler.py         # Python asynchronous web crawler
│
├── src/                   # React frontend
│   ├── components/        # Sidebar, GraphCard, Controls, Neighborhood
│   ├── hooks/
│   ├── App.js
│   ├── App.css
│   └── ...
│
├── public/
└── package.json
```

---

# ⚙️ **Installation & Setup**

## 1️⃣ Install Node Dependencies
```sh
npm install
```

## 2️⃣ Install Python Dependencies
```sh
pip install aiohttp beautifulsoup4
```

## 3️⃣ Start the Backend
```sh
node server.js
```
Backend will run at:
```
http://localhost:5001
```

## 4️⃣ Start the Frontend
```sh
npm start
```
Frontend runs at:
```
http://localhost:3000
```

---

# 🚀 **Using the Application**

1. Open the frontend:

   **http://localhost:3000**

2. Enter a URL such as:
   ```
   https://www.tum.de
   ```

3. Click **Crawl**

4. After crawling finishes:
   - Graph appears in the center  
   - Sidebar shows top PageRank pages  
   - Right panel shows incoming/outgoing links  

### Interactions:
- **Drag** → move the graph  
- **Scroll** → zoom  
- **Hover** → see PageRank + title  
- **Click** → explore link neighborhood  

---

# 🕷️ **Python Crawler Overview**

### Key behaviors:
- Normalizes URLs  
- Accepts subdomains (`*.tum.de`)  
- Ignores PDFs, images, videos, etc.  
- Detects HTML pages using content-type  
- Gracefully handles bot-detection, redirects, 403/302 HTML pages  
- Uses concurrent workers for maximum crawling speed  
- Returns JSON:

```json
{
  "graph": { "url": ["link1", "link2"] },
  "titles": { "url": "Page Title" },
  "crawl_info": {
    "start_url": "",
    "pages_crawled": 0,
    "max_pages": 30,
    "max_depth": 2
  }
}
```

### Manual Test
You can test crawl manually:
```sh
python3 crawler/crawler.py https://www.tum.de --max-pages 30 --max-depth 2
```

---

# 🛠️ Troubleshooting

### ❗ Backend: “Crawler failed to start”
Your environment may use `python` instead of `python3`.

Fix:
```sh
set PYTHON=python      # on Windows
export PYTHON=python   # on mac/Linux
```

### ❗ Graph is Empty
- Backend not running  
- Invalid URL  
- Domain blocks bots (common for large institutions)  

### ❗ Windows SSL Issues
Try:
```sh
pip install certifi
```
or test a different website.

---

# 👥 **Team**

**Bandersnatchers**  
TUM Hackathon Project

---

# 📜 **License**

This project is licensed under the **MIT License**.
