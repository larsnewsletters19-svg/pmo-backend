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
        
        return jsonify({
            'success': True,
            'content': content
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
