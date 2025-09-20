# Generating Printable PDFs (Windows)

This repo includes a complete beginner’s guide at docs/BEGINNERS_GUIDE.md. Here are reliable ways to export it to PDF on Windows.

Option A: Visual Studio Code (Recommended)
1) Open the project folder in VS Code
2) Install the extension: yzhang.markdown-all-in-one or tomoki1207.markdown-pdf
3) Open docs/BEGINNERS_GUIDE.md
4) Press Ctrl+Shift+P and run: Markdown PDF: Export (pdf)
5) The PDF will be created alongside the Markdown file (BEGINNERS_GUIDE.pdf)

Option B: Pandoc (if installed)
1) Install Pandoc: https://pandoc.org/installing.html
2) In PowerShell from the project root, run:
   pandoc "docs/BEGINNERS_GUIDE.md" -o "docs/BEGINNERS_GUIDE.pdf" --from gfm --pdf-engine=wkhtmltopdf
Notes:
- You may also use --pdf-engine=weasyprint or xelatex depending on what you have installed.

Option C: Print via Browser
1) Right-click docs/BEGINNERS_GUIDE.md and choose Open With -> your Markdown viewer or GitHub Desktop preview
2) Or paste the content into a Markdown renderer in your browser
3) Press Ctrl+P and choose Save as PDF

Tip: Diagrams
- The ER diagram is provided as an image: docs/diagrams/ERD.svg. It will render in most Markdown-to-PDF tools.
- Mermaid flowcharts in the guide may require a renderer that supports Mermaid. If your tool doesn’t, rely on the ERD.svg and textual explanations.

Need an automated script? Let me know and I’ll add a PowerShell script that uses Microsoft Edge headless to print an HTML-rendered version to PDF.
