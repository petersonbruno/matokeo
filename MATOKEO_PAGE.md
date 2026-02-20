# Add Student Results Page

A mobile-first form for adding and submitting student exam results in Swahili.

## Features Implemented ✅

### Page Layout
- **Header** with title "Ongeza Matokeo", class name, subject, and optional teacher name
- **Mobile-first responsive design** with large, easy-to-tap inputs
- **Gradient backgrounds** for visual appeal

### Student Management
- **Student Cards** with three inputs per student:
  - Student Name (text input)
  - Registration Number (text input)
  - Marks (number input, 0-100)
- **Add Student Button** (+ Ongeza Mwanafunzi) to add more students
- **Remove Student Button** available when multiple students exist
- **Form Validation** ensuring all fields are filled and marks are 0-100

### Token Validation
- Validates token from URL query parameter (`?token=xyz`)
- Displays error if token is missing or invalid
- Loads class and subject information based on token

### Autosave
- Automatically saves student data to localStorage every 1 second after changes
- Shows "💾 Data imehifadhiwa" message briefly after saving
- Restores saved data when page reloads

### Submission
- **Sticky bottom submit button** (✔ TUMA MATOKEO)
- Shows loading state with "⏳ Inatengeneza Excel..." during submission
- Clears saved data after successful submission

### Success Screen
- Shows "✅ Matokeo yametumwa kikamilifu" confirmation
- **Download Excel** button to download results as spreadsheet
- **Back to WhatsApp** button to return to chat

### Error Handling
- Network error states with retry capability
- Token expiration handling
- Form validation errors with user-friendly messages in Swahili

## File Structure

```
app/matokeo/
├── page.tsx                    # Main page component
├── components/
│   ├── Header.tsx             # Page header with class/subject info
│   ├── StudentCard.tsx        # Individual student input card
│   └── SuccessScreen.tsx      # Success confirmation page
app/api/
├── validate-token/
│   └── route.ts               # Token validation endpoint
├── submit-results/
│   └── route.ts               # Results submission endpoint
├── download-excel/
│   └── route.ts               # Excel file download endpoint
```

## TODOs - Backend Implementation Needed

### Token Validation (`/api/validate-token`)
- [ ] Implement actual token verification against database
- [ ] Add token expiration check
- [ ] Return correct class and subject data from database
- [ ] Add authentication/security layer

### Results Submission (`/api/submit-results`)
- [ ] Implement Excel file generation using `exceljs` or similar library
- [ ] Store results in database
- [ ] Validate token before processing
- [ ] Handle concurrent submissions
- [ ] Add transaction support for data integrity

### Excel Download (`/api/download-excel`)
- [ ] Implement Excel file retrieval from storage
- [ ] Add proper HTTP headers for file download
- [ ] Implement cleanup of old files
- [ ] Add file size limits

### Database Schema (Suggested)
```
Tokens table:
- id
- token (unique, indexed)
- class_id
- subject_id
- teacher_id
- created_at
- expires_at
- is_used (boolean)

Results table:
- id
- token_id
- student_name
- registration_number
- marks
- subject
- class
- submitted_at
- excel_file_path
```

## Dependencies to Install

```bash
npm install exceljs
```

## Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
# Add database credentials if needed
```

## How to Use

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```

2. Access the page with a valid token:
   ```
   http://localhost:3000/matokeo?token=YOUR_TOKEN_HERE
   ```

3. Fill in student information:
   - Enter student names
   - Enter registration numbers
   - Enter marks (0-100)
   - Click "Ongeza Mwanafunzi" to add more students

4. Click "TUMA MATOKEO" to submit
   - The page will validate all fields
   - Generate and download Excel file
   - Show success confirmation

## Testing

Test the following scenarios:
- [ ] Invalid/missing token
- [ ] Token expiration
- [ ] Form validation (empty fields, invalid marks)
- [ ] Autosave functionality
- [ ] Page reload with saved data
- [ ] Excel generation and download
- [ ] Multiple student submission
- [ ] Network error handling
- [ ] Mobile responsiveness

## Notes

- All user-facing text is in Swahili (Kiswahili)
- Uses Tailwind CSS for styling
- Fully mobile-responsive with touch-friendly inputs
- Data persisted locally in browser until submitted
- Form prevents submission until all validation passes
