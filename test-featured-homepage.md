### Testing Featured Books on Home Page

## Test URLs:

1. **Home Page** (should show featured books):
   GET http://localhost:3001

2. **Featured Books API**:
   GET http://localhost:3001/api/books?featured=true

3. **All Books API**:
   GET http://localhost:3001/api/books

4. **Books Page** (for comparison):
   GET http://localhost:3001/books

## Expected Behavior:

✅ Home page loads with featured books section
✅ Featured books are fetched from API with `isFeatured: true`
✅ Books display with same design as books page
✅ Click on book opens modal with details
✅ Borrow functionality works for logged-in users
✅ Favorites functionality works
✅ Loading state shows skeleton cards
✅ Empty state shows when no featured books
✅ "View All Books" button redirects to books page

## Featured Books Status:
- Currently 6 books are marked as featured (50% of total)
- Featured books include research, technical, and academic titles
- All books have proper availability status
