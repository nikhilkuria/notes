# Notes Application

A static HTML-based notes application with markdown support and tags.

## Features

- Create and view notes with markdown support
- Live markdown preview while editing
- Tag support for organizing notes
- Responsive grid layout
- Modal-based editing and viewing
- Mock API endpoints for demonstration

## Technical Details

### API Endpoints

The application currently uses mock API endpoints that can be replaced with real backend services:

1. `getAllNotes()`: Returns all notes
2. `getNote(id)`: Returns a specific note by ID
3. `createNote(note)`: Creates a new note

### Note Structure

```javascript
{
    id: number,
    title: string,
    content: string, // Markdown content
    tags: string[],
    createdAt: string // ISO date string
}
```

### Dependencies

- Tailwind CSS (via CDN)
- Marked.js (for markdown parsing)

## Usage

1. Open `index.html` in a web browser
2. Click "Add Note" to create a new note
3. Write your note in markdown format
4. Add tags (comma-separated)
5. Click "Save Note" to save
6. Click on any note to view its full content

## Development

To modify the application:

1. Edit `index.html` for structure changes
2. Modify `styles.css` for custom styling
3. Update `app.js` for functionality changes

## Future Improvements

- Add note editing functionality
- Implement note deletion
- Add search functionality
- Add tag filtering
- Implement real backend API integration
- Add local storage support 