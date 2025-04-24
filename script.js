// Replace with your Gemini API key
const API_KEY = 'AIzaSyB93BVNqQA5e3x_gKtaFHhpSb-3buTSM9Q';
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const generalModeBtn = document.getElementById('general-mode');
const creativeModeBtn = document.getElementById('creative-mode');
const creativeOptions = document.getElementById('creative-options');
const promptOptions = document.querySelectorAll('.prompt-option');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

// Chat history functionality
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat');

// Settings functionality
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const saveProfileBtn = document.getElementById('save-profile');
const darkModeToggle = document.getElementById('dark-mode');
const autoSaveToggle = document.getElementById('auto-save');

// Theme functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const themeText = themeToggle.querySelector('span');

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

let currentMode = 'general';
let currentPrompt = '';

// DOM Elements
const generalChatSection = document.getElementById('general-chat-section');
const creativeChatSection = document.getElementById('creative-chat-section');
const generalMessages = document.getElementById('general-messages');
const creativeMessages = document.getElementById('creative-messages');
const generalInput = document.getElementById('general-input');
const creativeInput = document.getElementById('creative-input');
const generalSendButton = document.getElementById('general-send-button');
const creativeSendButton = document.getElementById('creative-send-button');

// Check authentication and set up initial message
window.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Display user name
    const userData = JSON.parse(user);
    userName.textContent = userData.name;
    
    // Add personalized welcome message
    addMessage(`Hello ${userData.name}! I'm your AI assistant. How can I help you today?`, false, chatMessages);

    // Load chat history
    loadChatHistory();

    // Load user settings
    loadUserSettings();

    // Load theme
    loadTheme();

    // Add welcome message and suggestions when the page loads
    const welcomeMessage = `
        <div class="welcome-message">
            <h2>Welcome to AI Chat Assistant! 👋</h2>
            <p>I'm here to help you with any questions or tasks you have. Here are some things you can ask me:</p>
            <div class="suggestions">
                <button class="suggestion-btn">Explain quantum computing</button>
                <button class="suggestion-btn">Help me write a resume</button>
                <button class="suggestion-btn">Plan a healthy meal</button>
                <button class="suggestion-btn">Teach me about AI</button>
            </div>
        </div>
    `;
    chatMessages.innerHTML = welcomeMessage;

    // Add click handlers for suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            handleUserInput();
        });
    });
});

// Handle logout
logoutBtn.addEventListener('click', () => {
    // Clear all user-related data
    localStorage.removeItem('user');
    localStorage.removeItem('chatHistory');
    
    // Redirect to login page
    window.location.href = 'auth.html';
});

// Add message to chat
function addMessage(content, isUser = false, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<p>${content}</p>`;
    
    // Add message actions for bot messages
    if (!isUser) {
        const messageActions = document.createElement('div');
        messageActions.className = 'message-actions';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn tooltip';
        copyBtn.innerHTML = '<i class="far fa-clipboard"></i>';
        copyBtn.innerHTML += '<span class="tooltiptext">Copy to clipboard</span>';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-clipboard-check"></i>';
                copyBtn.innerHTML += '<span class="tooltiptext">Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="far fa-clipboard"></i>';
                    copyBtn.innerHTML += '<span class="tooltiptext">Copy to clipboard</span>';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text:', err);
                copyBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                copyBtn.innerHTML += '<span class="tooltiptext">Failed to copy</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="far fa-clipboard"></i>';
                    copyBtn.innerHTML += '<span class="tooltiptext">Copy to clipboard</span>';
                }, 2000);
            });
        });
        
        // Regenerate button
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'regenerate-btn tooltip';
        regenerateBtn.innerHTML = '<i class="fas fa-rotate"></i>';
        regenerateBtn.innerHTML += '<span class="tooltiptext">Regenerate response</span>';
        regenerateBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent event bubbling
            regenerateBtn.disabled = true; // Prevent multiple clicks
            regenerateBtn.style.opacity = '0.5';
            try {
                await regenerateResponse(messageDiv);
            } finally {
                regenerateBtn.disabled = false;
                regenerateBtn.style.opacity = '1';
            }
        });
        
        messageActions.appendChild(copyBtn);
        messageActions.appendChild(regenerateBtn);
        messageDiv.appendChild(messageActions);
    }
    
    messageDiv.appendChild(messageContent);
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

async function regenerateResponse(messageDiv) {
    // Get the last user message before this bot message
    const messages = Array.from(messageDiv.parentElement.children);
    const currentIndex = messages.indexOf(messageDiv);
    let userMessage = '';
    
    // Look for the last user message before this bot message
    for (let i = currentIndex - 1; i >= 0; i--) {
        if (messages[i].classList.contains('user-message')) {
            userMessage = messages[i].querySelector('.message-content p').textContent;
            break;
        }
    }
    
    if (!userMessage) {
        console.error('Could not find user message to regenerate response');
        messageDiv.querySelector('.message-content p').textContent = 
            'Sorry, I could not find the original message to regenerate the response.';
        return;
    }

    // Show typing indicator
    const typingIndicator = showTypingIndicator(messageDiv.parentElement);
    messageDiv.style.opacity = '0.5'; // Dim the current message
    
    try {
        // Generate new response using the same prompt
        const response = await generateContent(userMessage, currentMode);
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Update the message content with animation
        const contentElement = messageDiv.querySelector('.message-content p');
        contentElement.style.transition = 'opacity 0.3s ease';
        contentElement.style.opacity = '0';
        
        setTimeout(() => {
            contentElement.textContent = response;
            contentElement.style.opacity = '1';
            messageDiv.style.opacity = '1';
        }, 300);
        
        // Update chat history if auto-save is enabled
        const settings = JSON.parse(localStorage.getItem('settings') || '{"autoSave": true}');
        if (settings.autoSave) {
            const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            const lastItem = history[0];
            if (lastItem) {
                lastItem.response = response;
                localStorage.setItem('chatHistory', JSON.stringify(history));
            }
        }
    } catch (error) {
        removeTypingIndicator(typingIndicator);
        messageDiv.style.opacity = '1';
        messageDiv.querySelector('.message-content p').textContent = 
            `Sorry, I encountered an error while regenerating the response: ${error.message}. Please try again.`;
    }
}

// Generate content using Gemini API
async function generateContent(message, type = 'general') {
    try {
        let prompt;
        if (type === 'general') {
            prompt = message;
        } else {
            // Creative writing mode
            if (type === 'prompt') {
                prompt = `Generate a creative writing prompt in the ${message} genre. Make it unique and inspiring.`;
            } else if (type === 'story') {
                prompt = currentPrompt
                    ? `Write a complete short story based on this prompt: "${currentPrompt}". The story should be engaging, well-structured, and have a clear beginning, middle, and end.`
                    : `Write a complete short story in the ${message} genre. The story should be engaging, well-structured, and have a clear beginning, middle, and end.`;
            }
        }

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: type === 'general' ? 0.7 : 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            throw new Error('Invalid response format from API');
        }

        const generatedContent = data.candidates[0].content.parts[0].text;
        
        // If we generated a prompt, store it for potential story generation
        if (type === 'prompt') {
            currentPrompt = generatedContent;
        }

        return generatedContent;
    } catch (error) {
        console.error('Error:', error);
        return `Sorry, I encountered an error while processing your message: ${error.message}. Please try again.`;
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    historyList.innerHTML = ''; // Clear existing history
    history.forEach(item => addHistoryItem(item));
}

// Save chat history to localStorage
function saveChatHistory(message, response, type = 'general') {
    const settings = JSON.parse(localStorage.getItem('settings') || '{"autoSave": true}');
    if (!settings.autoSave) return;

    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const newItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message,
        response,
        type
    };
    history.unshift(newItem);
    if (history.length > 50) history.pop();
    localStorage.setItem('chatHistory', JSON.stringify(history));
    addHistoryItem(newItem);
}

// Add a history item to the UI
function addHistoryItem(item) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <i class="fas fa-comment"></i>
        <span class="content">${item.message.substring(0, 50) + (item.message.length > 50 ? '...' : '')}</span>
        <button class="delete-chat-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;
    historyList.appendChild(historyItem);

    // Add click event to load chat history
    historyItem.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-chat-btn')) {
            loadChatHistory(item);
        }
    });

    // Add click event to delete button
    const deleteBtn = historyItem.querySelector('.delete-chat-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
            // Remove from localStorage
            const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            const updatedHistory = history.filter(chat => chat.id !== item.id);
            localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
            
            // Remove from UI
            historyItem.remove();
            
            // Clear chat messages if this was the active chat
            if (document.querySelector('.history-item.active') === historyItem) {
                chatMessages.innerHTML = '';
                updateWelcomeMessage();
            }
        }
    });
}

// Switch to creative mode
function switchToCreativeMode() {
    currentMode = 'creative';
    generalModeBtn.classList.remove('active');
    creativeModeBtn.classList.add('active');
    generalChatSection.classList.remove('active');
    creativeChatSection.classList.add('active');
    document.querySelector('.chat-header p').textContent = 'Get inspired with AI-powered writing prompts and stories';
    
    // Show creative options
    creativeOptions.classList.remove('hidden');
    
    // Clear current chat and add welcome message
    creativeMessages.innerHTML = '';
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    addMessage(`Hello ${userData.name || 'User'}! I'm your creative writing assistant. Choose a genre below to get started with a writing prompt, or type your own creative request.`, false, creativeMessages);
}

// Switch to general mode
function switchToGeneralMode() {
    currentMode = 'general';
    generalModeBtn.classList.add('active');
    creativeModeBtn.classList.remove('active');
    generalChatSection.classList.add('active');
    creativeChatSection.classList.remove('active');
    document.querySelector('.chat-header p').textContent = 'Ask me anything, and I\'ll help you with your questions';
    
    // Hide creative options
    creativeOptions.classList.add('hidden');
    
    // Clear current chat and add welcome message
    generalMessages.innerHTML = '';
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    addMessage(`Hello ${userData.name || 'User'}! I'm your AI assistant. How can I help you today?`, false, generalMessages);
}

// Mode toggle event listeners
generalModeBtn.addEventListener('click', () => {
    switchToGeneralMode();
    // Clear current chat and add welcome message
    chatMessages.innerHTML = '';
    const userData = JSON.parse(localStorage.getItem('user'));
    addMessage(`Hello ${userData.name}! I'm your AI assistant. How can I help you today?`, false, chatMessages);
});

creativeModeBtn.addEventListener('click', () => {
    switchToCreativeMode();
    // Clear current chat and add welcome message
    chatMessages.innerHTML = '';
    const userData = JSON.parse(localStorage.getItem('user'));
    addMessage(`Hello ${userData.name}! I'm your creative writing assistant. I can help you generate writing prompts or full stories. What would you like to create today?`, false, chatMessages);
});

// Handle prompt option clicks
promptOptions.forEach(option => {
    option.addEventListener('click', async () => {
        const genre = option.dataset.type;
        const messageContainer = currentMode === 'general' ? generalMessages : creativeMessages;
        
        addMessage(`Generating a ${genre} prompt...`, true, messageContainer);
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator(messageContainer);

        try {
            const response = await generateContent(genre, 'prompt');
            removeTypingIndicator(typingIndicator);
            addMessage(response, false, messageContainer);
            addMessage(`Would you like me to generate a story based on this prompt? Just type "story" or click one of the genre buttons above.`, false, messageContainer);
            
            // Save to history
            saveChatHistory(genre, response, 'prompt');
        } catch (error) {
            removeTypingIndicator(typingIndicator);
            addMessage(`Error: ${error.message}`, false, messageContainer);
        }
    });
});

function showTypingIndicator(container) {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = `
        <div class="message-content">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    container.appendChild(typingIndicator);
    container.scrollTop = container.scrollHeight;
    return typingIndicator;
}

function removeTypingIndicator(indicator) {
    if (indicator) {
        indicator.remove();
    }
}

// Handle user input for both modes
async function handleUserInput(input, messageContainer) {
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true, messageContainer);
    input.value = '';

    // Show typing indicator
    const typingIndicator = showTypingIndicator(messageContainer);

    try {
        let response;
        if (currentMode === 'creative' && message.toLowerCase() === 'story') {
            // Generate a story based on the current prompt
            response = await generateContent(message, 'story');
        } else {
            // Generate regular content
            response = await generateContent(message, currentMode);
        }
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add bot response
        addMessage(response, false, messageContainer);

        // Save to chat history
        saveChatHistory(message, response, currentMode);
    } catch (error) {
        removeTypingIndicator(typingIndicator);
        addMessage("Sorry, I encountered an error. Please try again.", false, messageContainer);
    }
}

// Event listeners for both inputs
generalSendButton.addEventListener('click', () => handleUserInput(generalInput, generalMessages));
creativeSendButton.addEventListener('click', () => handleUserInput(creativeInput, creativeMessages));

generalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput(generalInput, generalMessages);
    }
});

creativeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput(creativeInput, creativeMessages);
    }
});

// New chat button functionality
newChatBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to start a new chat? Your current conversation will be cleared.')) {
        chatMessages.innerHTML = '';
        // Show welcome message again
        const welcomeMessage = `
            <div class="welcome-message">
                <h2>Welcome to AI Chat Assistant! 👋</h2>
                <p>I'm here to help you with any questions or tasks you have. Here are some things you can ask me:</p>
                <div class="suggestions">
                    <button class="suggestion-btn">Explain quantum computing</button>
                    <button class="suggestion-btn">Help me write a resume</button>
                    <button class="suggestion-btn">Plan a healthy meal</button>
                    <button class="suggestion-btn">Teach me about AI</button>
                </div>
            </div>
        `;
        chatMessages.innerHTML = welcomeMessage;
        
        // Re-add click handlers for suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                userInput.value = btn.textContent;
                handleUserInput();
            });
        });
    }
});

// Load user settings
function loadUserSettings() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const settings = JSON.parse(localStorage.getItem('settings') || '{"darkMode": true, "autoSave": true}');
    
    // Set profile inputs
    profileNameInput.value = userData.name || '';
    profileEmailInput.value = userData.email || '';
    
    // Set preferences
    darkModeToggle.checked = settings.darkMode;
    autoSaveToggle.checked = settings.autoSave;
}

// Save user settings
function saveUserSettings() {
    const userData = {
        name: profileNameInput.value,
        email: profileEmailInput.value
    };
    
    const settings = {
        darkMode: document.body.getAttribute('data-theme') === 'dark',
        autoSave: autoSaveToggle.checked
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Update UI
    document.getElementById('user-name').textContent = userData.name || 'User';
}

// Toggle settings panel
function toggleSettings() {
    settingsPanel.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Event listeners for settings
settingsBtn.addEventListener('click', toggleSettings);
closeSettingsBtn.addEventListener('click', toggleSettings);
overlay.addEventListener('click', toggleSettings);

// Save profile changes
saveProfileBtn.addEventListener('click', () => {
    saveUserSettings();
    toggleSettings();
});

// Handle preference changes
darkModeToggle.addEventListener('change', () => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.darkMode = darkModeToggle.checked;
    localStorage.setItem('settings', JSON.stringify(settings));
    document.body.classList.toggle('dark-mode', settings.darkMode);
});

autoSaveToggle.addEventListener('change', () => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.autoSave = autoSaveToggle.checked;
    localStorage.setItem('settings', JSON.stringify(settings));
});

// Load theme from localStorage
function loadTheme() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{"darkMode": true}');
    document.body.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
    updateThemeButton(settings.darkMode);
}

// Update theme button appearance
function updateThemeButton(isDarkMode) {
    if (isDarkMode) {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    } else {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDarkMode ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    updateThemeButton(!isDarkMode);
    
    // Save theme preference
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.darkMode = !isDarkMode;
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Event listener for theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Handle sidebar toggle
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('expanded');
    
    // Update toggle button icon
    const icon = sidebarToggle.querySelector('i');
    if (sidebar.classList.contains('hidden')) {
        icon.className = 'fas fa-bars';
    } else {
        icon.className = 'fas fa-times';
    }
});

// File upload functionality
const fileInput = document.getElementById('file-input');
const fileUploadBtn = document.getElementById('file-upload-btn');
const filePreview = document.createElement('div');
filePreview.className = 'file-preview';
document.querySelector('.input-container').appendChild(filePreview);

fileUploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            
            if (file.type.startsWith('image/')) {
                fileItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="remove-file" aria-label="Remove file">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else {
                fileItem.innerHTML = `
                    <div class="file-icon">
                        <i class="fas fa-file"></i>
                        <span>${file.name}</span>
                    </div>
                    <button class="remove-file" aria-label="Remove file">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            fileItem.querySelector('.remove-file').addEventListener('click', () => {
                fileItem.remove();
            });
            
            filePreview.appendChild(fileItem);
        };
        reader.readAsDataURL(file);
    });
});

// Accessibility controls
const highContrastToggle = document.getElementById('high-contrast-toggle');
const fontSizeIncrease = document.getElementById('font-size-increase');
const fontSizeDecrease = document.getElementById('font-size-decrease');

highContrastToggle.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
});

fontSizeIncrease.addEventListener('click', () => {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    document.body.style.fontSize = `${currentSize * 1.1}px`;
});

fontSizeDecrease.addEventListener('click', () => {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    document.body.style.fontSize = `${currentSize / 1.1}px`;
});

// Update welcome message to include user's name
function updateWelcomeMessage() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userData.name || 'User';
    const welcomeMessage = `
        <div class="welcome-message">
            <h2>Hello, ${userName}! 👋</h2>
            <p>I'm here to help you with any questions or tasks you have. Here are some things you can ask me:</p>
            <div class="suggestions">
                <button class="suggestion-btn">Explain quantum computing</button>
                <button class="suggestion-btn">Help me write a resume</button>
                <button class="suggestion-btn">Plan a healthy meal</button>
                <button class="suggestion-btn">Teach me about AI</button>
            </div>
        </div>
    `;
    chatMessages.innerHTML = welcomeMessage;
    
    // Re-add click handlers for suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            handleUserInput();
        });
    });
}

// Update the welcome message when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateWelcomeMessage();
}); 
