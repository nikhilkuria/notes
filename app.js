// Mock API endpoints
const API = {
    // Get all notes
    getAllNotes: async () => {
        const res = await fetch('https://nikhilkuriakose.app.n8n.cloud/webhook/notes');
        if (!res.ok) throw new Error('Failed to fetch notes');
        // API now returns a raw array of notes
        return await res.json();
    },

    // Get a single note
    getNote: async (id) => {
        const res = await fetch(`https://nikhilkuriakose.app.n8n.cloud/webhook/1ec0df4a-ba79-4abb-b755-c208e6aaa82a/notes/${id}`);
        if (!res.ok) throw new Error('Failed to fetch note');
        return await res.json();
    },

    // Create a new note
    createNote: async (note) => {
        const res = await fetch('https://nikhilkuriakose.app.n8n.cloud/webhook/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: note.title,
                tags: note.tags,
                body_markdown: note.content
            })
        });
        if (!res.ok) throw new Error('Failed to create note');
        return await res.json();
    },

    // Update an existing note
    updateNote: async (id, note) => {
        
        const res = await fetch(`https://nikhilkuriakose.app.n8n.cloud/webhook/1ec0df4a-ba79-4abb-b755-c208e6aaa82a/notes/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: note.title,
                tags: note.tags,
                body_markdown: note.content
            })
        });
        if (!res.ok) throw new Error('Failed to update note');
        return
    },

    // Delete a note
    deleteNote: async (id) => {
        const res = await fetch(`https://nikhilkuriakose.app.n8n.cloud/webhook/1ec0df4a-ba79-4abb-b755-c208e6aaa82a/notes/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete note');
        return true;
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
    cleanupViewModal();
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
    try {
        if (currentNoteId) {
            // Update existing note
            await API.updateNote(currentNoteId, note);
        } else {
            // Create new note
            await API.createNote(note);
        }
        elements.noteModal.classList.add('hidden');
        loadNotes();
    } catch (e) {
        alert('Failed to save note.');
    }
});

// Close modal when clicking outside
elements.noteModal.addEventListener('click', (e) => {
    if (e.target === elements.noteModal) {
        elements.noteModal.classList.add('hidden');
    }
});

elements.viewNoteModal.addEventListener('click', (e) => {
    if (e.target === elements.viewNoteModal) {
        cleanupViewModal();
        elements.viewNoteModal.classList.add('hidden');
    }
});

// Functions
// Add this new function to handle modal cleanup
function cleanupViewModal() {
    const header = elements.viewNoteModal.querySelector('.flex.justify-between');
    const headerActions = header.querySelector('.header-actions');
    if (headerActions) {
        // Get the close button from header actions
        const closeButton = headerActions.querySelector('button:last-child');
        if (closeButton) {
            // Remove it from header actions
            closeButton.remove();
            // Add it back to the header
            header.appendChild(closeButton);
        }
        // Remove the header actions container
        headerActions.remove();
    }
}

async function showNote(note) {
    // Fetch full note details
    let fullNote = note;
    try {
        fullNote = await API.getNote(note.id);
    } catch (e) {
        // fallback to preview if fetch fails
    }
    elements.viewNoteTitle.textContent = fullNote.title;
    elements.viewNoteContent.innerHTML = marked.parse(fullNote.body || '');
    elements.viewNoteTags.innerHTML = (Array.isArray(fullNote.tags) ? fullNote.tags : []).map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // Find the header and clear any existing actions
    const header = elements.viewNoteModal.querySelector('.flex.justify-between');
    // Remove all existing .header-actions containers
    header.querySelectorAll('.header-actions').forEach(el => el.remove());
    // Remove any closeViewModal button left in the header
    const orphanClose = header.querySelector('#closeViewModal');
    if (orphanClose) orphanClose.remove();
    
    // Create header actions container
    const headerActions = document.createElement('div');
    headerActions.className = 'flex items-center gap-2 header-actions';
    
    // Add edit button
    const editButton = document.createElement('button');
    editButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg';
    editButton.textContent = 'Edit';
    editButton.onclick = () => {
        // Close view modal and open edit modal
        cleanupViewModal();
        elements.viewNoteModal.classList.add('hidden');
        currentNoteId = fullNote.id;
        elements.noteEditor.value = fullNote.body || '';
        elements.noteTags.value = (fullNote.tags || []).join(', ');
        elements.notePreview.innerHTML = marked.parse(fullNote.body || '');
        elements.modalTitle.textContent = 'Edit Note';
        elements.noteModal.classList.remove('hidden');
        elements.noteEditor.focus();
    };
    headerActions.appendChild(editButton);
    
    // Always move the close button into the header actions
    const closeButton = elements.closeViewModal;
    if (closeButton) {
        headerActions.appendChild(closeButton);
    }
    header.appendChild(headerActions);
    
    elements.viewNoteModal.classList.remove('hidden');
}

async function loadNotes() {
    elements.notesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading notes...</div>';
    try {
        let notes = await API.getAllNotes();
        if (!notes || notes.length === 0) {
            elements.notesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">No notes found.</div>';
            return;
        }
        // Normalize tags to always be an array
        notes = notes.map(note => ({
            ...note,
            tags: Array.isArray(note.tags) ? note.tags : []
        }));
        elements.notesGrid.innerHTML = '';
        notes.forEach(note => {
            // Create a card with title and tags only
            const card = document.createElement('div');
            card.className = 'note-card bg-white rounded-lg shadow p-4 cursor-pointer';
            card.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">${note.title}</h3>
                <div class="flex flex-wrap gap-2">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
            card.addEventListener('click', () => showNote(note));
            elements.notesGrid.appendChild(card);
        });
    } catch (e) {
        elements.notesGrid.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load notes.</div>';
        console.error(e);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadNotes); 