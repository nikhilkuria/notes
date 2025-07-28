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
            method: 'PATCH',
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
        const res = await fetch(`https://nikhilkuriakose.app.n8n.cloud/webhook/1ec0df4a-ba79-4abb-b755-c208e6aaa82a/notesd/${id}`, {
            method: 'POST'
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
    modalTitleInput: document.getElementById('modalTitleInput'),
    searchInput: document.getElementById('searchInput'),
};

// State
let currentNoteId = null;

// Initial markdown template
const initialMarkdownTemplate = `
Write your note content here using markdown.

## Examples:
- Use **bold** or *italic* text
- Create lists with - or 1. 2. 3.
- Add \`code\` or \`\`\`code blocks\`\`\`
- Create [links](https://example.com)
- Add > blockquotes`;

// Event Listeners
elements.addNoteBtn.addEventListener('click', () => {
    currentNoteId = null;
    elements.modalTitleInput.value = '';
    elements.noteEditor.value = initialMarkdownTemplate;
    elements.noteTags.value = '';
    elements.notePreview.innerHTML = marked.parse(initialMarkdownTemplate);
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
    const title = elements.modalTitleInput.value.trim() || 'Untitled Note';
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
        elements.modalTitleInput.value = fullNote.title || '';
        elements.noteEditor.value = fullNote.body || '';
        elements.noteTags.value = (fullNote.tags || []).join(', ');
        elements.notePreview.innerHTML = marked.parse(fullNote.body || '');
        elements.noteModal.classList.remove('hidden');
        elements.noteEditor.focus();
    };
    headerActions.appendChild(editButton);

    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = async () => {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                await API.deleteNote(fullNote.id);
                cleanupViewModal();
                elements.viewNoteModal.classList.add('hidden');
                loadNotes();
            } catch (e) {
                alert('Failed to delete note.');
            }
        }
    };
    headerActions.appendChild(deleteButton);
    
    // Always move the close button into the header actions
    const closeButton = elements.closeViewModal;
    if (closeButton) {
        headerActions.appendChild(closeButton);
    }
    header.appendChild(headerActions);
    
    elements.viewNoteModal.classList.remove('hidden');
}

let allNotesCache = [];

function showSearchBar(show) {
    if (elements.searchInput) {
        elements.searchInput.classList.toggle('hidden', !show);
    }
}

function filterNotes(notes, query) {
    if (!query) return notes;
    const q = query.toLowerCase();
    return notes.filter(note => {
        const inTitle = note.title && note.title.toLowerCase().includes(q);
        const inTags = Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(q));
        return inTitle || inTags;
    });
}

async function loadNotes(searchQuery = '') {
    showSearchBar(true);
    elements.notesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading notes...</div>';
    try {
        if (allNotesCache.length === 0) {
            let notes = await API.getAllNotes();
            // Normalize tags to always be an array
            notes = notes.map(note => ({
                ...note,
                tags: Array.isArray(note.tags) ? note.tags : []
            }));
            allNotesCache = notes;
        }
        let notes = filterNotes(allNotesCache, searchQuery);
        if (!notes || notes.length === 0) {
            elements.notesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">No notes found.</div>';
            return;
        }
        elements.notesGrid.innerHTML = '';
        notes.forEach(note => {
            // Create a card with title and tags only
            const card = document.createElement('div');
            card.className = 'note-card rounded-lg shadow p-4 cursor-pointer relative';
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-semibold">${note.title}</h3>
                    <div class="flex gap-2">
                        <button class="edit-card-btn p-1 rounded hover:bg-blue-100" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.788 3 21l1.212-4.5 12.65-12.013ZM19 7l-2-2" />
                            </svg>
                        </button>
                        <button class="delete-card-btn p-1 rounded hover:bg-red-100" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-red-500">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
            // Card click opens view modal
            card.addEventListener('click', (e) => {
                // Prevent click if edit/delete button is clicked
                if (e.target.closest('.edit-card-btn') || e.target.closest('.delete-card-btn')) return;
                showNote(note);
            });
            // Edit button handler
            card.querySelector('.edit-card-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                // Fetch full note and open in edit mode
                let fullNote = note;
                try {
                    fullNote = await API.getNote(note.id);
                } catch {}
                currentNoteId = fullNote.id;
                elements.modalTitleInput.value = fullNote.title || '';
                elements.noteEditor.value = fullNote.body || '';
                elements.noteTags.value = (fullNote.tags || []).join(', ');
                elements.notePreview.innerHTML = marked.parse(fullNote.body || '');
                elements.noteModal.classList.remove('hidden');
                elements.noteEditor.focus();
            });
            // Delete button handler
            card.querySelector('.delete-card-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this note?')) {
                    try {
                        await API.deleteNote(note.id);
                        allNotesCache = [];
                        loadNotes(elements.searchInput.value);
                    } catch {
                        alert('Failed to delete note.');
                    }
                }
            });
            elements.notesGrid.appendChild(card);
        });
    } catch (e) {
        elements.notesGrid.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load notes.</div>';
        console.error(e);
    }
}

elements.searchInput.addEventListener('input', (e) => {
    loadNotes(e.target.value);
});

// Hide search bar when not showing all cards (e.g., in modals)
function hideSearchBarOnModal() {
    showSearchBar(false);
}
elements.addNoteBtn.addEventListener('click', hideSearchBarOnModal);
elements.saveNote.addEventListener('click', hideSearchBarOnModal);
elements.closeModal.addEventListener('click', () => showSearchBar(true));
elements.closeViewModal.addEventListener('click', () => showSearchBar(true));

document.addEventListener('DOMContentLoaded', () => {
    showSearchBar(true);
    loadNotes();
}); 