# Langsnack Notebook V2

## What is working in the front-end
- Existing journal writing, prompts, streak, calendar and missions
- New unified navigation
- New submission categories
- Drag-and-drop attachment selection
- My Work cards and search
- Student question threads (browser storage prototype)
- Saved explanations and search (browser storage prototype)
- Version progress display

## Important production notes
1. Writing submissions still post `submissionCreated` to the parent Wix page and are also retained in browser storage for preview compatibility.
2. Attachment names are retained in the browser prototype, but the actual file bytes are not uploaded. Use Wix Media Manager or an upload URL in the Wix host page before launch.
3. Question threads and bookmarks need CMS collections before they can sync across devices. Suggested collections: `JournalThreads`, `JournalBookmarks`, `JournalAttachments`.
4. Do not expose `teacher-dashboard.html` publicly. Embed it inside a private Wix page and retain `Permissions.Admin` in backend methods.
