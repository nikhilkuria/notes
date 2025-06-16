// Mock API endpoints
const API = {
    // Get all notes
    getAllNotes: async () => {
        // Mock response
        return [
            {
                id: 1,
                title: "Welcome to Notes App",
                content: "# Welcome!\n\nThis is a sample note to get you started.\n\n## Features\n- Markdown support\n- Tags\n- Preview while editing",
                tags: ["welcome", "guide"],
                createdAt: "2024-03-20T10:00:00Z"
            },
            {
                id: 2,
                title: "Meeting Notes",
                content: "## Project Updates\n\n1. Frontend development\n2. API integration\n3. Testing\n\n### Next Steps\n- [ ] Complete UI\n- [ ] Add authentication\n- [ ] Deploy",
                tags: ["meeting", "project"],
                createdAt: "2024-03-19T15:30:00Z"
            }
        ];
    },

    // Get a single note
    getNote: async (id) => {
        const notes = await API.getAllNotes();
        return notes.find(note => note.id === id);
    },

    // Create a new note
    createNote: async (note) => {
        // In a real app, this would make an API call
        console.log('Creating note:', note);
        return {
            ...note,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
    }
};

// DOM Elements
const elements = {
    addNoteBtn: document.getElementById('addNoteBtn'),
    noteModal: document.getElementById('noteModal'),
    closeModal: document.getElementById('closeModal'),
    noteEditor: document.getElementById('noteEditor'),
    notePreview: document.getElementById('notePreview'),
    noteTags: document.getElementById('noteTags'),
    saveNote: document.getElementById('saveNote'),
    notesGrid: document.getElementById('notesGrid'),
    viewNoteModal: document.getElementById('viewNoteModal'),
    closeViewModal: document.getElementById('closeViewModal'),
    viewNoteTitle: document.getElementById('viewNoteTitle'),
    viewNoteContent: document.getElementById('viewNoteContent'),
    viewNoteTags: document.getElementById('viewNoteTags'),
    modalTitle: document.getElementById('modalTitle')
};

// State
let currentNoteId = null;

// Initial markdown template
const initialMarkdownTemplate = `# Your Note Title

Write your note content here using markdown.

## Examples:
- Use **bold** or *italic* text
- Create lists with - or 1. 2. 3.
- Add \`code\` or \`\`\`code blocks\`\`\`
- Create [links](https://example.com)
- Add > blockquotes

## Tags
Add tags below (comma separated)`;

// Event Listeners
elements.addNoteBtn.addEventListener('click', () => {
    currentNoteId = null;
    elements.noteEditor.value = initialMarkdownTemplate;
    elements.noteTags.value = '';
    elements.notePreview.innerHTML = marked.parse(initialMarkdownTemplate);
    elements.modalTitle.textContent = 'Add New Note';
    elements.noteModal.classList.remove('hidden');
    elements.noteEditor.focus();
});

elements.closeModal.addEventListener('click', () => {
    elements.noteModal.classList.add('hidden');
});

elements.closeViewModal.addEventListener('click', () => {
    elements.viewNoteModal.classList.add('hidden');
});

elements.noteEditor.addEventListener('input', () => {
    const content = elements.noteEditor.value;
    elements.notePreview.innerHTML = marked.parse(content);
});

elements.saveNote.addEventListener('click', async () => {
    const content = elements.noteEditor.value;
    const tags = elements.noteTags.value.split(',').map(tag => tag.trim()).filter(Boolean);
    
    // Extract title from first line of content
    const title = content.split('\n')[0].replace(/^#\s*/, '') || 'Untitled Note';
    
    const note = {
        title,
        content,
        tags
    };

    await API.createNote(note);
    elements.noteModal.classList.add('hidden');
    loadNotes();
});

// Close modal when clicking outside
elements.noteModal.addEventListener('click', (e) => {
    if (e.target === elements.noteModal) {
        elements.noteModal.classList.add('hidden');
    }
});

elements.viewNoteModal.addEventListener('click', (e) => {
    if (e.target === elements.viewNoteModal) {
        elements.viewNoteModal.classList.add('hidden');
    }
});

// Functions
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card bg-white rounded-lg shadow p-4 cursor-pointer';
    
    // Get preview content (first 100 characters)
    const previewContent = note.content.replace(/^#\s*/, '').substring(0, 100) + '...';
    
    card.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">${note.title}</h3>
        <p class="text-gray-600 mb-4">${previewContent}</p>
        <div class="flex flex-wrap gap-2">
            ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;

    card.addEventListener('click', () => showNote(note));
    return card;
}

async function showNote(note) {
    elements.viewNoteTitle.textContent = note.title;
    elements.viewNoteContent.innerHTML = marked.parse(note.content);
    elements.viewNoteTags.innerHTML = note.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    elements.viewNoteModal.classList.remove('hidden');
}

async function loadNotes() {
    const notes = await API.getAllNotes();
    elements.notesGrid.innerHTML = '';
    notes.forEach(note => {
        elements.notesGrid.appendChild(createNoteCard(note));
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadNotes); 