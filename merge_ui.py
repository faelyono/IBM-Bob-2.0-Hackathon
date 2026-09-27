import os
import re
from bs4 import BeautifulSoup

def read_file(path):
    encodings = ['utf-16le', 'utf-8', 'utf-16']
    for enc in encodings:
        try:
            with open(path, 'r', encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise Exception(f"Could not read {path}")

def merge_htmls(hero_path, dashboard_path, output_path):
    hero_content = read_file(hero_path)
    dashboard_content = read_file(dashboard_path)
    
    hero_soup = BeautifulSoup(hero_content, 'html.parser')
    dash_soup = BeautifulSoup(dashboard_content, 'html.parser')
    
    # Create the output soup
    out_soup = BeautifulSoup("<!DOCTYPE html>\n<html><head></head><body></body></html>", 'html.parser')
    out_head = out_soup.head
    out_body = out_soup.body
    
    # 1. Merge title and meta from dashboard
    if dash_soup.title:
        out_head.append(dash_soup.title)
    
    # 2. Merge all external links/scripts (CDN, fonts, etc.)
    seen_urls = set()
    for head_tag in hero_soup.head.find_all(['link', 'script', 'style']) + dash_soup.head.find_all(['link', 'script', 'style']):
        if head_tag.name == 'style':
            continue # Handle styles separately
            
        url = head_tag.get('href') or head_tag.get('src')
        if url:
            if url not in seen_urls:
                seen_urls.add(url)
                out_head.append(head_tag)
        else:
            out_head.append(head_tag)
            
    # 3. Merge Styles with Scoping
    hero_styles = []
    for style in hero_soup.find_all('style'):
        css = style.string or ''
        css = re.sub(r'\bbody\s*{', '#state1 {', css)
        css = re.sub(r'\bhtml\s*{', '#state1 {', css)
        hero_styles.append(css)
    
    dash_styles = []
    for style in dash_soup.find_all('style'):
        css = style.string or ''
        css = re.sub(r'\bbody\s*{', '#state2 {', css)
        css = re.sub(r'\bhtml\s*{', '#state2 {', css)
        dash_styles.append(css)
        
    merged_css = """
/* === BASE STYLES === */
body, html {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background-color: #000; /* Dark background */
}

/* === STATE TRANSITIONS === */
.state-container {
    transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
    width: 100%;
    min-height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
}

#state1 {
    z-index: 10;
}

#state2 {
    z-index: 5;
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
}

#state2.active {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
    z-index: 20;
}

#state1.hidden {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
}

/* === HERO STYLES (State 1) === */
""" + "\n".join(hero_styles) + """

/* === DASHBOARD STYLES (State 2) === */
""" + "\n".join(dash_styles)

    style_tag = out_soup.new_tag('style')
    style_tag.string = merged_css
    out_head.append(style_tag)
    
    # 4. Merge Bodies
    state1_div = out_soup.new_tag('div', id='state1', **{'class': 'state-container'})
    for child in list(hero_soup.body.contents):
        if child.name != 'script':
            state1_div.append(child)
            
    state2_div = out_soup.new_tag('div', id='state2', **{'class': 'state-container'})
    for child in list(dash_soup.body.contents):
        if child.name != 'script':
            state2_div.append(child)
            
    out_body.append(state1_div)
    out_body.append(state2_div)
    
    # 5. Merge Scripts
    hero_scripts = []
    for script in hero_soup.body.find_all('script'):
        if script.string: hero_scripts.append(script.string)
        
    dash_scripts = []
    for script in dash_soup.body.find_all('script'):
        if script.string: dash_scripts.append(script.string)
        
    merged_js = """
// === STATE MANAGEMENT & INITIALIZATION ===

function transitionToDashboard() {
    const state1 = document.getElementById('state1');
    const state2 = document.getElementById('state2');
    
    state1.classList.add('hidden');
    state2.classList.add('active');
    
    // Trigger dashboard initialization if it exists
    if (typeof init === 'function') {
        init();
    }
}

function transitionToHero() {
    const state1 = document.getElementById('state1');
    const state2 = document.getElementById('state2');
    
    state2.classList.remove('active');
    state1.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hook up the black submit button in State 1 to transition
    // Find the submit button in hero (you might need to adjust the selector)
    const submitBtn = document.querySelector('#state1 button[type="submit"], #state1 .submit-btn, #state1 .search-btn, #state1 form button');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            transitionToDashboard();
        });
    }

    // 2. Hook up Bob Release Guard logo to return to State 1
    // The logo text or image in dashboard navbar
    const bobLogo = document.querySelector('#state2 .logo, #state2 .navbar-brand, #state2 [class*="logo"]');
    if (bobLogo) {
        bobLogo.style.cursor = 'pointer';
        bobLogo.addEventListener('click', (e) => {
            e.preventDefault();
            transitionToHero();
        });
    }
});

// === HERO SCRIPTS ===
""" + "\n".join(hero_scripts) + """

// === DASHBOARD SCRIPTS ===
""" + "\n".join(dash_scripts)

    script_tag = out_soup.new_tag('script')
    script_tag.string = merged_js
    out_body.append(script_tag)
    
    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(out_soup.prettify())
        
    print(f"Successfully merged into {output_path}")

if __name__ == "__main__":
    base_dir = r"c:\Users\Lenovo\Downloads\IBM-Bob-2.0-Hackathon-main (1)\IBM-Bob-2.0-Hackathon-main"
    hero_path = os.path.join(base_dir, "hero_perfect.html")
    dashboard_path = os.path.join(base_dir, "dashboard_perfect.html")
    output_path = os.path.join(base_dir, "bob_sessions", "release-readiness-dashboard.html")
    
    try:
        import bs4
    except ImportError:
        print("Please install beautifulsoup4: pip install beautifulsoup4")
        exit(1)
        
    merge_htmls(hero_path, dashboard_path, output_path)
