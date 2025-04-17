async function connectSSE() {
  const url = 'https://text.pollinations.ai/openai';
  
  try {
    const response = await fetch(url, {
      method: 'POST', // Can be POST if server supports it
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': 'Bearer your-token',  // Custom headers
        //'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        "model": 'openai-large',
        "messages": [
        {
          "role": "system",
          "content": "You're code writer you can't explain anything but you can code well. available html only not md ( eg:- ``` not allowed for codes )"
        },
        {
          "role": "user",
          "content": "Create portfolio website with tailwind css in html"
        }],
        "private": true,
        "stream": true,
        //"jsonMode": true,
      }),
      //credentials: 'include'  // For cookies
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the readable stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      //console.log('Received chunk:', chunk);
      
      // Process SSE messages (may need to handle partial messages)
      processSSEMessages(chunk);
    }
  } catch (error) {
    console.error('SSE Error:', error);
    // Implement reconnection logic here
  }
}

function processSSEMessages(data) {
  // Split by double newlines (SSE messages are separated by \n\n)
  const messages = data.split('\n\n').filter(msg => msg.trim());
  
  messages.forEach(msg => {
    const lines = msg.split('\n');
    let event = { type: 'message', data: '' };
    
    lines.forEach(line => {
      if (line.startsWith('event:')) {
        event.type = line.replace('event:', '');
      } else if (line.startsWith('data:')) {
        event.data = line.replace('data:', '');
      }
      // Handle id: and retry: fields if needed
    });
    
    //console.log('Parsed SSE event:', event);
    // Dispatch to your application
    handleSSEEvent(event);
  });
}

let str = ''

function handleSSEEvent(event) {
  // Your event handling logic here
  switch (event.type) {
    case 'message':
      //console.log('Standard message:', event.data);
      try {
        let dt = JSON.parse(event.data)
        
        if (dt) {
          str = dt.choices[0].delta.content;
          
          var session = editor.getSession();
          var doc = session.getDocument();
          var position = editor.getCursorPosition();
          doc.insert(position, str);
          editor.focus();
          
        }
      } catch (err) {
        //
      }
      break;
    case 'status-update':
      console.log('Status update:', event.data);
      break;
    default:
      console.log('Unknown event type:', event.type, 'Data:', event.data);
  }
}