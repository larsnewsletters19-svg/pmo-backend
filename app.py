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
    try:
        # Hämta data från frontend
        data = request.json
        
        system_prompt = data.get('system_prompt', '')
        user_prompt = data.get('user_prompt', '')
        max_tokens = data.get('max_tokens', 4096)
        
        if not system_prompt or not user_prompt:
            return jsonify({'error': 'Missing prompts'}), 400
        
        if not CLAUDE_API_KEY:
            return jsonify({'error': 'API key not configured'}), 500
        
        # Anropa Claude API
        client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            messages=[{
                "role": "user",
                "content": f"{system_prompt}\n\n{user_prompt}"
            }]
        )
        
        # Extrahera text från response
        content = message.content[0].text
        
        return jsonify({
            'success': True,
            'content': content
        })
        
    except anthropic.APIError as e:
        print(f"Claude API Error: {e}")
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
