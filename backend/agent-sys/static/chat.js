const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    msgDiv.innerHTML = `
    <div class="max-w-[75%] px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line
      ${role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}">
      ${content}
    </div>
  `;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;
    appendMessage('user', question);
    chatInput.value = '';
    appendMessage('assistant', '...');
    try {
        const res = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        // Remove the loading message
        chatWindow.lastChild.remove();
        appendMessage('assistant', data.answer);
    } catch (err) {
        chatWindow.lastChild.remove();
        appendMessage('assistant', 'Sorry, there was an error.');
    }
});
