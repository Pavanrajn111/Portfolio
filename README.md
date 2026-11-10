# Pavan Raj N — Software Engineering Portfolio

> Interactive modern personal portfolio website built with semantic HTML5, modern CSS (glassmorphism, conic-gradient running borders, CSS grid & flexbox), and vanilla JavaScript.

---

## Overview

A performant, accessible personal portfolio website showcasing:
- **Hero**: Clean full-bleed landing screen with custom artwork and liquid glass tabs.
- **About Me**: Equal-height two-column layout, interactive skill pill tags, and stat cards with running conic-gradient comet borders.
- **Technical Skills**: 6-category cards with hardware-accelerated animated comet borders, category line icons, and 30+ interactive technology pills.
- **Core Focus Areas**: Interactive expanding accordion gallery detailing core engineering focus areas.
- **Featured Projects**: Folder-reveal project cards featuring interactive preview notch animations, 3D popouts, and live deployment links (Vendora, Vantage Suite, CouponEx, VarshaSetu).
- **Verified Certifications**: Interactive 3D card carousel with verified credentials, live verification links, and PDF downloads.
- **Academic & Engineering Journey**: Scroll-driven milestone timeline connected by a dynamic laser beam progress track with active node pulse illumination.
- **Curriculum Vitae / Resume**: Cinematic resume card with downloadable PDF and verified badges.
- **Connect / Contact**: Interactive terminal interface with live copy feedback and social links.

---

## Tech Stack

- **Markup**: HTML5 (semantic, accessible with screen-reader support)
- **Styling**: Modern CSS3 (CSS `@property`, Conic Gradients, CSS Grid, Flexbox, Glassmorphism, Backdrop Filters, `@media (prefers-reduced-motion)`)
- **Interactivity**: Vanilla JavaScript (ES6+, IntersectionObserver, Spring Physics engine, RAF parallax)
- **Fonts**: Space Grotesk, Anton, JetBrains Mono

---

## Project Structure

```text
├── index.html                   # Main single-page application markup
├── styles.css                   # Core stylesheet, animations, and responsive rules
├── script.js                    # Liquid glass tabs physics, parallax, and timeline engine
├── contact-cinematic.css        # Cinematic styling for the contact terminal section
├── resume-cinematic.css         # Styling for the resume / CV showcase
├── certifications.css           # 3D certifications carousel styles
├── certifications.js            # Carousel logic & interactive controls
├── certifications-data.js       # Verified certificate metadata & skills mapping
├── footer-cinematic.css         # Cinematic footer styles
├── footer-cinematic.js          # Interactive footer animations
├── pavan_image.png              # Hero section artwork
├── Pavan_Raj_N_Resume_Updated.pdf # Resume PDF
├── Certificates/                # Verified certificates (PDF)
├── Project/                     # Project screenshots & previews
└── public/                      # Certificate preview images
```

---

## Getting Started

To run the portfolio locally:

```bash
# Using Node.js npx serve
npx serve .

# Or using Python 3
python -m http.server 3000
```

Open `http://localhost:3000` in your web browser.

---

## Author

**Pavan Raj N**
- LinkedIn: [linkedin.com/in/pavanrajn](https://www.linkedin.com/in/pavanrajn)
- GitHub: [github.com/Pavanrajn111](https://github.com/Pavanrajn111)
- Email: [rajnpavan864@gmail.com](mailto:rajnpavan864@gmail.com)
