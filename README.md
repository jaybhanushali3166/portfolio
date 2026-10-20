# Jay Bhanushali — Portfolio & Blog

Personal portfolio and technical writing by Jay Bhanushali on system design, storage, and distributed systems. Built with [Eleventy (11ty)](https://www.11ty.dev/) v3.

## Requirements

- [Node.js](https://nodejs.org/) 20 or later

## Development

```bash
# Install dependencies
npm install

# Start local dev server with hot reload
npm start

# Build for production (outputs to _site)
npm run build
```

## Adding Content

### Adding a Blog Post

Create a new Markdown file inside `_posts/` named with the format `YYYY-MM-DD-slug.md`:

```markdown
---
title: "Your Post Title"
subtitle: "Brief summary or subtitle of the post"
tags: [tag1, tag2]
author: Jay Bhanushali
mathjax: true   # optional: enable MathJax if using LaTeX math
---

Your post content here...
```

The permalink will automatically be `/:year-:month-:day-:slug/`.

### Adding a Project

Add an item to `_data/projects.yml`:

```yaml
- name: Project Name
  summary: Short description of the project.
  meta: Category · Tech · Focus
  links:
    - label: Live Demo
      url: https://example.com
```

## Deployment

Pushes to `main` or `master` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml` to build and deploy to GitHub Pages.
