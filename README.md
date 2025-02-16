# 🌐 Romitagl.com - Central Landing Page

This repository hosts the central landing page for **romitagl.com**, serving as the main hub for all subdomains. It is deployed via GitHub Pages and configured with Google AdSense for monetization.

## 🚀 Project Overview

- **Domain:** [romitagl.com](https://romitagl.com)
- **Purpose:** Acts as a landing page linking to all subdomain websites.
- **Hosting:** GitHub Pages
- **Monetization:** Google AdSense enabled

## 📌 Setup Instructions

### 1️⃣ GitHub Pages Configuration

1. Go to your repository (`www`) → **Settings** → **Pages**.
2. Under "Custom domain", enter: `romitagl.com`.
3. Enable **HTTPS**.

### 2️⃣ DNS Configuration

Set the following records in your domain registrar (e.g., Cloudflare, GoDaddy, Namecheap):

#### **A Records (For Root Domain `romitagl.com`)**

```plaintext
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: Auto
```

#### **CNAME Record (For `www.romitagl.com`)**

```plaintext
Type: CNAME
Name: www
Value: romitagl.github.io
TTL: Auto
```

### 3️⃣ Subdomains Configuration

For each GitHub repository (e.g., `web-tools`), repeat the following steps:

1. **Go to GitHub Pages settings** → Enable GitHub Pages.
2. **Set a custom domain** (e.g., `web-tools.romitagl.com`).
3. **Update DNS with a CNAME record:**

   ```plaintext
   Type: CNAME
   Name: web-tools
   Value: romitagl.github.io
   TTL: Auto
   ```

### 4️⃣ Google AdSense Integration

1. **Verify your domain with AdSense:**
   - Sign in to [Google AdSense](https://www.google.com/adsense/).
   - Add `romitagl.com` as the main site.
   - Place the required `<meta>` tag in `<head>` of `index.html`:

     ```html
     <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" crossorigin="anonymous"></script>
     ```

2. **Ensure all subdomains also include this AdSense snippet** if they will serve ads.

### 5️⃣ Sitemap for SEO

Create a `sitemap.xml` in `public/sitemap.xml` to help search engines index all subdomains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://romitagl.com/</loc>
  </url>
  <url>
    <loc>https://web-tools.romitagl.com/</loc>
  </url>
</urlset>
```

Add `robots.txt` in `public/robots.txt`:

```plaintext
User-agent: *
Allow: /
Sitemap: https://romitagl.com/sitemap.xml
```

### 6️⃣ Testing & Verification

- Use [dnschecker.org](https://www.dnschecker.org/) to verify DNS changes.
- Ensure `romitagl.com` and all subdomains load correctly.
- Check if Google AdSense is displaying ads on `romitagl.com`.

## 🎯 Final Structure

```
romitagl.com (Landing Page - GitHub Pages, AdSense)
├── web-tools.romitagl.com (GitHub Pages for Web Tools)
├── blog.romitagl.com (GitHub Pages for Blog)
└── other-subdomains...
```

## ✅ Conclusion

With this setup:

- `romitagl.com` serves as the main entry point and AdSense-verified domain.
- Each subdomain is a separate GitHub repository using GitHub Pages.
- AdSense ads can be displayed across `romitagl.com` and its subdomains.
- A `sitemap.xml` ensures search engine visibility.
