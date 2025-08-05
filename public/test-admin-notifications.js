// Test script to create borrow requests for testing admin notifications
// Run this in the browser console while logged in as a regular user

async function createTestBorrowRequest() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (!token) {
      console.error('No auth token found. Please log in first.');
      return;
    }

    console.log('Creating test borrow request...');

    // Create a borrow request (you'll need to replace bookId with an actual book ID)
    const response = await fetch('/api/borrow-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookId: 'REPLACE_WITH_ACTUAL_BOOK_ID', // You'll need to get this from the books page
        requestedDays: 14
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Test borrow request created successfully:', result);
      console.log('✅ Admin should now see a notification for this request!');
    } else {
      const error = await response.json();
      console.error('Failed to create borrow request:', error);
    }
  } catch (error) {
    console.error('Error creating test borrow request:', error);
  }
}

// Instructions for testing:
console.log(`
🧪 ADMIN NOTIFICATION TESTING INSTRUCTIONS:

1. Open the application in two browser tabs:
   - Tab 1: Login as a regular user
   - Tab 2: Login as an admin

2. In Tab 1 (Regular User):
   - Go to the books page (/books)
   - Find a book and note its ID from the URL or inspect element
   - Replace 'REPLACE_WITH_ACTUAL_BOOK_ID' in the script above
   - Run: createTestBorrowRequest()

3. In Tab 2 (Admin):
   - Go to admin panel (/admin)
   - Look for the notification bell icon in the navbar
   - You should see a red badge with the number of pending requests
   - Click the bell to see the notification dropdown
   - Click on a notification to be redirected to the requests page

4. Notification Features:
   ✅ Real-time notification count badge
   ✅ Dropdown with detailed notification information
   ✅ Click to redirect to requests page
   ✅ Auto-refresh every 30 seconds
   ✅ Shows user info and book details
   ✅ Time ago formatting

To test manually, simply:
- Have a user request a book
- Check admin panel for notifications
- Click notification to go to requests page
`);

// Export for easy access
window.createTestBorrowRequest = createTestBorrowRequest;
