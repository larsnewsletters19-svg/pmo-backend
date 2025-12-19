# AI PMO Generator Backend - v7.0
# Last updated: 2024-12-09 08:00 UTC
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import anthropic

app = Flask(__name__)
CORS(app)  # Tillåt requests från frontend

# Hämta API-nyckel från Railway environment variable
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')

if not CLAUDE_API_KEY:
    print("⚠️ WARNING: CLAUDE_API_KEY environment variable not set!")

@app.route('/')
def home():
    """Servera frontend (index.html)"""
    return send_file('index.html')

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'api_key_set': bool(CLAUDE_API_KEY)
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate document using Claude API"""
    print(f"🔵 Generate endpoint called - Method: {request.method}")
    print(f"🔵 Content-Type: {request.headers.get('Content-Type')}")
    
    try:
        # Hämta data från frontend
        data = request.json
        print(f"🔵 Request data received: {bool(data)}")
        
        system_prompt = data.get('system_prompt', '')
        user_prompt = data.get('user_prompt', '')
        max_tokens = data.get('max_tokens', 4096)
        
        print(f"🔵 Prompts - System: {len(system_prompt)} chars, User: {len(user_prompt)} chars")
        
        if not system_prompt or not user_prompt:
            print("❌ Missing prompts")
            return jsonify({'error': 'Missing prompts'}), 400
        
        if not CLAUDE_API_KEY:
            print("❌ API key not configured")
            return jsonify({'error': 'API key not configured'}), 500
        
        print("🔵 Calling Claude API...")
        
        # Ta bort proxy miljövariabler som kan orsaka problem
        for var in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
            if var in os.environ:
                del os.environ[var]
                print(f"🔵 Removed {var} environment variable")
        
        # Anropa Claude API
        client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            system=system_prompt,  # System prompt ska vara separat!
            messages=[{
                "role": "user",
                "content": user_prompt
            }]
        )
        
        # Extrahera text från response
        content = message.content[0].text
        print(f"✅ Claude API success - Response: {len(content)} chars")
        
        # DUPLICATION CLEANING (samma som v6 backend)
        import re
        
        print("🔵 Starting duplication cleaning...")
        
        # Step 1: Remove version headers
        cleaned = re.sub(r'^[\s\n]*#{1,2}\s*(?:OneNote|Word)[- ]?[Vv]ersion\s*:?\s*\n+', '', content, flags=re.IGNORECASE | re.MULTILINE)
        cleaned = re.sub(r'\n+[\s]*#{1,2}\s*(?:OneNote|Word)[- ]?[Vv]ersion\s*:?\s*\n+', '\n\n', cleaned, flags=re.IGNORECASE)
        
        # Step 2: Remove separator lines
        cleaned = re.sub(r'\n\s*[-=]{3,}\s*\n', '\n\n', cleaned)
        
        # Step 3: Intelligent duplication detection
        def strip_formatting(text):
            stripped = re.sub(r'#{1,6}\s+', '', text)
            stripped = re.sub(r'\*\*(.+?)\*\*', r'\1', stripped)
            stripped = re.sub(r'\*(.+?)\*', r'\1', stripped)
            stripped = re.sub(r'\|', '', stripped)
            stripped = re.sub(r'[-:]+', '', stripped)
            stripped = re.sub(r'\s+', ' ', stripped)
            return stripped.strip().lower()
        
        # Preserve H1 title
        title_match = re.search(r'^(#\s+.+?)$', cleaned, re.MULTILINE)
        preserved_title = title_match.group(0) + '\n\n' if title_match else ''
        
        # Remove H1 from content for duplicate detection
        content_without_title = re.sub(r'^#\s+.+?\n+', '', cleaned, count=1, flags=re.MULTILINE)
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in content_without_title.split('\n\n') if p.strip()]
        
        if len(paragraphs) > 5:
            # Check for duplication
            midpoint = len(paragraphs) // 2
            first_half_stripped = ' '.join([strip_formatting(p) for p in paragraphs[:midpoint]])
            second_half_stripped = ' '.join([strip_formatting(p) for p in paragraphs[midpoint:]])
            
            first_words = set(first_half_stripped.split())
            second_words = set(second_half_stripped.split())
            
            if first_words and second_words:
                overlap = len(first_words & second_words)
                overlap_ratio = overlap / len(first_words) if len(first_words) > 0 else 0
                
                print(f"🔵 Overlap ratio: {overlap_ratio:.2f}")
                
                if overlap_ratio > 0.75:
                    print("🔵 Duplication detected! Using first half only.")
                    paragraphs = paragraphs[:midpoint]
        
        # Reconstruct content
        cleaned = preserved_title + '\n\n'.join(paragraphs)
        
        # Clean up excessive whitespace
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        cleaned = cleaned.strip()
        
        print(f"✅ Cleaning complete - Final: {len(cleaned)} chars")
        
        return jsonify({
            'success': True,
            'content': cleaned
        })
        
    except anthropic.APIError as e:
        print(f"❌ Claude API Error: {e}")
        return jsonify({
            'error': f'Claude API error: {str(e)}'
        }), 500
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
