"""
AI PMO Generator - Backend Server
Flask server that generates formatted Word documents using python-docx
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import re
from io import BytesIO
import tempfile

app = Flask(__name__)

# Configure CORS - allow GitHub Pages
CORS(app, 
     origins=["https://larsnewsletters19-svg.github.io", "http://localhost:*", "http://127.0.0.1:*"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=False,
     max_age=3600)


def create_formatted_docx(markdown_text):
    """Convert markdown text to formatted Word document"""
    doc = Document()
    
    # Set default font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Segoe UI'
    font.size = Pt(11)
    
    lines = markdown_text.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            i += 1
            continue
        
        # H1 - Rubrik1
        if line.startswith('# '):
            text = line[2:].strip()
            p = doc.add_paragraph(text)
            p.style = doc.styles['Heading 1']
            run = p.runs[0]
            run.font.name = 'Segoe UI Semibold'
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(0x1A, 0x4D, 0x80)
            run.bold = True
        
        # H2 - Rubrik2
        elif line.startswith('## '):
            text = line[3:].strip()
            p = doc.add_paragraph(text)
            p.style = doc.styles['Heading 2']
            run = p.runs[0]
            run.font.name = 'Segoe UI Semibold'
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(0x41, 0x6D, 0x94)
            run.bold = True
        
        # H3 - Rubrik3
        elif line.startswith('### '):
            text = line[4:].strip()
            p = doc.add_paragraph(text)
            p.style = doc.styles['Heading 3']
            run = p.runs[0]
            run.font.name = 'Segoe UI Semibold'
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0x44, 0x44, 0x44)
            run.bold = True
        
        # Bullet point
        elif line.startswith('* ') or line.startswith('• '):
            text = line[2:].strip()
            p = doc.add_paragraph(text, style='List Bullet')
            run = p.runs[0]
            run.font.name = 'Segoe UI'
            run.font.size = Pt(11)
        
        elif line.startswith('- '):
            text = line[2:].strip()
            p = doc.add_paragraph(text, style='List Bullet')
            run = p.runs[0]
            run.font.name = 'Segoe UI'
            run.font.size = Pt(11)
        
        # Numbered list
        elif re.match(r'^\d+\. ', line):
            text = re.sub(r'^\d+\. ', '', line).strip()
            p = doc.add_paragraph(text, style='List Number')
            run = p.runs[0]
            run.font.name = 'Segoe UI'
            run.font.size = Pt(11)
        
        # Table detection (markdown table)
        elif '|' in line and i + 1 < len(lines) and '|' in lines[i + 1]:
            # Parse table
            table_lines = []
            while i < len(lines) and '|' in lines[i]:
                table_lines.append(lines[i])
                i += 1
            i -= 1  # Back up one line
            
            # Filter out separator lines
            table_rows = [l for l in table_lines if not re.match(r'^[\|\s\-:]+$', l)]
            
            if len(table_rows) > 0:
                # Parse columns
                cols = [cell.strip() for cell in table_rows[0].split('|') if cell.strip()]
                num_cols = len(cols)
                num_rows = len(table_rows)
                
                # Create table
                table = doc.add_table(rows=num_rows, cols=num_cols)
                table.style = 'Light Grid Accent 1'
                
                for row_idx, row_text in enumerate(table_rows):
                    cells = [cell.strip() for cell in row_text.split('|') if cell.strip()]
                    for col_idx, cell_text in enumerate(cells[:num_cols]):
                        cell = table.rows[row_idx].cells[col_idx]
                        cell.text = cell_text
                        
                        # Format cell
                        for paragraph in cell.paragraphs:
                            for run in paragraph.runs:
                                run.font.name = 'Segoe UI'
                                run.font.size = Pt(10)
                                
                                # Header row - bold
                                if row_idx == 0:
                                    run.bold = True
                
                doc.add_paragraph()  # Add spacing after table
        
        # Normal paragraph
        else:
            p = doc.add_paragraph(line)
            for run in p.runs:
                run.font.name = 'Segoe UI'
                run.font.size = Pt(11)
        
        i += 1
    
    return doc

@app.route('/api/generate', methods=['POST'])
def generate():
    """Handle generation requests and return both text and .docx file"""
    try:
        data = request.json
        # Try to get API key from request, fallback to environment variable
        api_key = data.get('api_key') or os.environ.get('CLAUDE_API_KEY')
        prompt = data.get('prompt')
        
        if not api_key:
            return jsonify({'error': 'Missing API key. Please configure CLAUDE_API_KEY in Railway or provide api_key in request'}), 400
        
        if not prompt:
            return jsonify({'error': 'Missing prompt'}), 400
        
        # Call Claude API
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': 'claude-sonnet-4-20250514',
                'max_tokens': 4000,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            }
        )
        
        if response.status_code != 200:
            return jsonify({'error': response.json()}), response.status_code
        
        claude_response = response.json()
        content = claude_response['content'][0]['text']
        
        # Split into OneNote and Word versions
        # Look for "Word Version" or "Word version" header
        word_split = re.split(r'\n\s*(?:Word[- ]?version|Word Version|WORD VERSION)\s*:?\s*\n', content, flags=re.IGNORECASE)
        
        if len(word_split) > 1:
            # Found Word version
            onenote_version = word_split[0].strip()
            # Remove "OneNote version" header if present
            onenote_version = re.sub(r'^(?:OneNote[- ]?version|OneNote Version|ONENOTE VERSION)\s*:?\s*\n', '', onenote_version, flags=re.IGNORECASE).strip()
            word_text = word_split[1].strip()
        else:
            # No split found, use entire content for both
            onenote_version = content
            word_text = content
        
        # Ensure word_text has markdown formatting
        if not any(marker in word_text for marker in ['#', '##', '**', '- ', '* ', '|']):
            # No markdown found, use content as-is
            word_text = content
        
        # Generate .docx file
        doc = create_formatted_docx(word_text)
        
        # Create persistent directory for generated files
        output_dir = os.path.join(os.path.dirname(__file__), 'generated_docs')
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate unique filename
        import time
        filename = f'pmo_doc_{int(time.time() * 1000)}.docx'
        filepath = os.path.join(output_dir, filename)
        
        # Save document
        doc.save(filepath)
        
        # Return response with filename (not full path for security)
        return jsonify({
            'content': claude_response['content'],
            'onenote_version': onenote_version,
            'word_version': word_text,
            'docx_file': filename
        })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<path:filename>', methods=['GET'])
def download(filename):
    """Download generated .docx file"""
    try:
        # Security: only allow filenames, no path traversal
        if '/' in filename or '\\' in filename:
            return jsonify({'error': 'Invalid filename'}), 400
        
        # Get file from generated_docs directory
        output_dir = os.path.join(os.path.dirname(__file__), 'generated_docs')
        filepath = os.path.join(output_dir, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            filepath,
            as_attachment=True,
            download_name='pmo_document.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print("=" * 60)
    print("🚀 AI PMO Generator Backend Server v2.0")
    print("=" * 60)
    print("✨ NY FUNKTION: Genererar riktiga .docx-filer!")
    print(f"Server körs på: http://{host}:{port}")
    print("Öppna nu ai-pmo-generator.html i din webbläsare")
    print("=" * 60)
    
    # Production mode if PORT is set by hosting platform
    debug_mode = os.environ.get('PORT') is None
    app.run(debug=debug_mode, port=port, host=host)
