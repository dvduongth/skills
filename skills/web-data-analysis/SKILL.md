---
name: web-data-analysis
description: |
  Collect, clean, analyze, and generate structured Markdown reports from web sources.

  Use this skill whenever you need to:
  - Fetch and analyze web pages, documentation, or online resources
  - Extract key insights from complex documents
  - Clean HTML noise and parse document structure
  - Generate comprehensive analysis reports
  - Work with Git repos, RSS feeds, PDFs, or Excel files

  Perfect for research reports, documentation analysis, competitor analysis, or any task
  that requires gathering information from the web and synthesizing it into actionable insights.
  Trigger whenever user mentions "analyze", "research", "collect data", "summarize", or
  provides a URL/link they want you to understand deeply.

compatible-tools:
  - agent-browser (for dynamic pages)
  - web_fetch (for static pages)
  - pdf_parser
  - xlsx_parser

tags:
  - web
  - research
  - analysis
  - documentation
  - automation
  - data-extraction

---

# Web Data Collection & Analysis Skill

## Overview

This skill guides the systematic collection, cleaning, analysis, and synthesis of information from web sources into structured Markdown reports.

The workflow consists of 6 steps:
1. **Receive Input** — URL or research request
2. **Fetch Content** — Static (web_fetch) or dynamic (agent-browser)
3. **Clean Data** — Remove HTML noise, navigation, ads, scripts
4. **Extract Structure** — Parse sections, headings, tables, code blocks
5. **Analyze Content** — Generate insights and key concepts
6. **Generate Report** — Create structured Markdown output

---

## When to Use This Skill

- User provides a URL and wants you to "analyze", "understand", "summarize", or "research" it
- User asks to extract data from documentation portals, wikis, or specification sites
- User wants a comprehensive report on web content (competitor analysis, tech research, etc.)
- Multi-page documents need structure extraction (sections, key points, tables)
- Documents exist in multiple formats (web, PDF, Excel) and need unified analysis

---

## Step 1: Receive Input

Clarify what the user wants analyzed:
- **URL or resource**: What's the source?
- **Scope**: Just overview, or deep technical details?
- **Output style**: Quick summary or comprehensive report?
- **Focus areas**: Any specific aspects to prioritize?

Example inputs:
- "Analyze this documentation: https://example.com/api-docs"
- "Research this GitHub repo and summarize the architecture"
- "Extract key concepts from this PDF specification"

---

## Step 2: Fetch Content

Choose the fetch method based on the page type:

**Static HTML pages** (documentation, wikis, blogs):
```
Use web_fetch(url) for fast retrieval
```

**Dynamic/JavaScript-heavy pages** (React SPAs, dashboards):
```
Use agent-browser:
  1. agent-browser.open(url)
  2. agent-browser.wait_for_content() [if needed]
  3. agent-browser.extract_text() or extract_structured()
```

**Special file types**:
- **PDF**: Use pdf_parser to extract text and structure
- **Excel/CSV**: Use xlsx_parser to read tables and metadata
- **Git repos**: Clone or browse via GitHub API

---

## Step 3: Clean Data

Remove noise from fetched content:

**HTML Cleaning Pipeline**:
1. Remove `<script>`, `<style>`, `<link>` tags
2. Remove navigation menus, sidebars, footers
3. Remove ads, tracking pixels, comments sections
4. Normalize whitespace
5. Decode HTML entities

**Output**: Clean, readable text with preserved structure

---

## Step 4: Extract Structure

Parse the document into a structured hierarchy:

```
{
  "title": "Document Title",
  "metadata": {
    "url": "https://...",
    "fetch_date": "2024-XX-XX"
  },
  "sections": [
    {
      "heading": "Section 1",
      "level": 1,
      "content": "Section text...",
      "subsections": [
        {
          "heading": "Subsection 1.1",
          "level": 2,
          "content": "Subsection text...",
          "key_points": ["Point 1", "Point 2"]
        }
      ],
      "tables": [...],
      "code_blocks": [...]
    }
  ],
  "links": [...]
}
```

**Extract**: headings, paragraphs, lists, tables, code blocks, links, images

---

## Step 5: Analyze Content

Generate insights from the structured document:

### Overview
- **Summary**: 1-2 paragraph overview of the document's purpose and main message
- **Audience**: Who is this for? (developers, business users, etc.)
- **Primary focus**: What's the main topic?

### Key Concepts
- Extract major concepts, terminology, and ideas
- Define important terms specific to the domain
- List in logical order (foundational → advanced)

### System Components / Architecture
- Identify major modules, services, or components
- Describe their roles and interactions
- Create a high-level system diagram if applicable

### Technical Details
- Deep dive into implementation specifics
- Algorithms, data structures, API details
- Configuration, parameters, options
- Code examples and usage patterns

### Important Notes
- Warnings or prerequisites
- Common pitfalls or gotchas
- Version compatibility information
- Dependency information

### Possible Applications / Use Cases
- How could this information be applied?
- Real-world scenarios
- Integration points with other systems
- Best practices

---

## Step 6: Generate Markdown Report

Create a structured, human-readable report using this template:

```markdown
# Analysis Report: [Document Title]

**Source**: [URL]
**Analyzed**: [Date]
**Document Type**: [Type — documentation, specification, blog post, etc.]

---

## 1. Overview

[Summary of document's purpose and main message]

**Audience**: [Who this is for]
**Primary Focus**: [Main topic/domain]

---

## 2. Key Concepts

- **Concept 1**: Definition and context
- **Concept 2**: Definition and context
- **Concept 3**: Definition and context

---

## 3. System Components / Architecture

| Component | Description | Key Responsibility |
|-----------|-------------|-------------------|
| Module A  | Brief description | What it does |
| Module B  | Brief description | What it does |

[Or use text format for prose descriptions]

---

## 4. Technical Details

### [Subsystem/Feature 1]
[Deep technical explanation, code examples, parameters]

### [Subsystem/Feature 2]
[Deep technical explanation, code examples, parameters]

---

## 5. Important Notes

- **Note 1**: [Prerequisite, warning, or gotcha]
- **Note 2**: [Version compatibility or dependency info]
- **Note 3**: [Best practice or common pitfall]

---

## 6. Possible Applications

- **Use case 1**: [Description of how this could be applied]
- **Use case 2**: [Description of how this could be applied]
- **Integration point**: [How this integrates with other systems]

---

## 7. Summary & Recommendations

[Synthesize the analysis: what are the key takeaways? What should the user do next?]

```

---

## Quality Checklist

Before finalizing the report:

- ✅ All major sections of the original document are represented
- ✅ Key technical details are accurate and complete
- ✅ Terminology is consistent throughout
- ✅ Code examples are properly formatted and runnable
- ✅ Links to original sources are preserved
- ✅ The report is understandable to the target audience
- ✅ All tables and structured data are properly formatted
- ✅ Key insights are highlighted and actionable

---

## Examples

### Example 1: API Documentation
**Input**: https://api.example.com/docs
**Output**: Analysis of endpoints, parameters, authentication, response formats, rate limiting, error codes, and usage examples.

### Example 2: Technical Specification
**Input**: GitHub specification document (.md)
**Output**: Architecture overview, key algorithms, data structures, performance considerations, and implementation guidelines.

### Example 3: GitHub Repository
**Input**: https://github.com/user/project
**Output**: Project purpose, architecture, key modules, setup instructions, and contribution guidelines.

---

## Safety & Best Practices

**DO**:
- Respect robots.txt and rate limiting
- Attribute sources and preserve original links
- Sanitize any embedded code before analysis
- Remove sensitive information (API keys, passwords, tokens)

**DON'T**:
- Scrape private or authenticated pages without permission
- Execute untrusted code from analyzed documents
- Expose credentials or sensitive data in reports
- Violate copyright by reproducing large content sections

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page requires login | Note in report that analysis is limited; request credentials if appropriate |
| Content is behind paywall | Analyze preview/abstract; note that full content is restricted |
| Dynamic content won't load | Use agent-browser with longer wait times; note if key content is JS-dependent |
| Huge document | Focus analysis on key sections; create table of contents for reference |
| Mixed formats (web + PDF + code) | Analyze each format separately, then synthesize findings in unified report |

---

