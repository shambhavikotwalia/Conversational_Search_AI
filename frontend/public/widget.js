(function() {
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #csa-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            z-index: 999999;
            overflow: hidden;
            transition: transform 0.3s ease;
            transform: translateY(150%);
        }
        #csa-widget-container.open {
            transform: translateY(0);
        }
        #csa-toggle-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: #000;
            color: #fff;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 999998;
            font-size: 24px;
        }
        #csa-header {
            background: #f8f9fa;
            padding: 16px;
            border-bottom: 1px solid #e9ecef;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
        }
        #csa-close-btn {
            cursor: pointer;
            border: none;
            background: none;
            font-size: 16px;
        }
        #csa-messages {
            flex-grow: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .csa-msg {
            padding: 10px 14px;
            border-radius: 8px;
            max-width: 85%;
            font-size: 14px;
            line-height: 1.4;
        }
        .csa-msg.user {
            background: #000;
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .csa-msg.ai {
            background: #f1f3f5;
            color: #212529;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        .csa-products {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-top: 8px;
        }
        .csa-product-card {
            background: #fff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 8px;
            min-width: 140px;
            font-size: 12px;
        }
        #csa-input-area {
            padding: 12px;
            border-top: 1px solid #e9ecef;
            display: flex;
            gap: 8px;
        }
        #csa-input {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 20px;
            outline: none;
        }
        #csa-send-btn {
            background: #000;
            color: #fff;
            border: none;
            border-radius: 20px;
            padding: 0 16px;
            cursor: pointer;
        }
        .csa-citations {
            font-size: 11px;
            color: #6c757d;
            margin-top: 6px;
        }
    `;
    document.head.appendChild(style);

    // Create UI
    const container = document.createElement('div');
    container.id = 'csa-widget-container';
    
    container.innerHTML = `
        <div id="csa-header">
            <span>Conversational Search</span>
            <button id="csa-close-btn">×</button>
        </div>
        <div id="csa-messages">
            <div class="csa-msg ai">Hi! Ask me anything about our products.</div>
        </div>
        <div id="csa-input-area">
            <input type="text" id="csa-input" placeholder="e.g., comfortable summer dress" />
            <button id="csa-send-btn">Send</button>
        </div>
    `;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'csa-toggle-btn';
    toggleBtn.innerHTML = '✨';
    
    document.body.appendChild(container);
    document.body.appendChild(toggleBtn);
    
    // Get Site Key
    const scriptTag = document.currentScript;
    const siteKey = scriptTag ? scriptTag.getAttribute('data-site-key') : 'site_public_demo';
    
    // API Call Logic
    async function sendMessage(text) {
        if (!text.trim()) return;
        
        const msgs = document.getElementById('csa-messages');
        
        // Add User Message
        msgs.innerHTML += `<div class="csa-msg user">${text}</div>`;
        document.getElementById('csa-input').value = '';
        msgs.scrollTop = msgs.scrollHeight;
        
        // Add Loading
        const loadingId = 'loading-' + Date.now();
        msgs.innerHTML += `<div id="${loadingId}" class="csa-msg ai">Searching...</div>`;
        msgs.scrollTop = msgs.scrollHeight;
        
        try {
            const res = await fetch('http://localhost:8000/v1/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Site-Key': siteKey
                },
                body: JSON.stringify({ query: text, limit: 5 })
            });
            
            const data = await res.json();
            document.getElementById(loadingId).remove();
            
            if (data.status === 'insufficient_evidence') {
                 msgs.innerHTML += `<div class="csa-msg ai">${data.answer}</div>`;
            } else {
                let html = `<div class="csa-msg ai">${data.answer}`;
                
                if (data.citations && data.citations.length > 0) {
                     html += `<div class="csa-citations">[Evidence cited from ${data.citations.length} reviews]</div>`;
                }
                
                if (data.products && data.products.length > 0) {
                    html += `<div class="csa-products">`;
                    data.products.forEach(p => {
                        html += `<div class="csa-product-card"><strong>${p.name || 'Product'}</strong><br/>${p.reason || ''}</div>`;
                    });
                    html += `</div>`;
                }
                
                html += `</div>`;
                msgs.innerHTML += html;
            }
            
        } catch (err) {
            document.getElementById(loadingId).remove();
            msgs.innerHTML += `<div class="csa-msg ai" style="color:red;">Failed to connect to search API.</div>`;
        }
        msgs.scrollTop = msgs.scrollHeight;
    }
    
    // Event Listeners
    toggleBtn.addEventListener('click', () => container.classList.add('open'));
    document.getElementById('csa-close-btn').addEventListener('click', () => container.classList.remove('open'));
    
    document.getElementById('csa-send-btn').addEventListener('click', () => {
        sendMessage(document.getElementById('csa-input').value);
    });
    document.getElementById('csa-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(e.target.value);
    });
})();
