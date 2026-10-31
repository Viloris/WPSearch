# Chrome Web Store declarations

## Single purpose description

Wikipedia Preview helps users look up Wikipedia articles without leaving the
page they are viewing. Users can search text they select or enter a query in
the extension popup, then preview and open matching Wikipedia articles.

## Permission justifications

### `storage`

The extension uses local browser storage to save user-selected settings,
favorites, and up to 20 recent search queries, and to cache the daily featured
Wikipedia article. This data stays in the user's browser and supports the
extension's search and personalization features.

### `contextMenus`

The extension adds an optional context-menu item for selected text so users
can start a Wikipedia search from the page they are viewing. The item is shown
only when the user has enabled it in the extension settings.
