# E-Sign Document System

## Overview
This page provides an e-signature interface for documents, with role-based functionality that automatically determines user permissions based on their role in the document workflow.

## Role-Based Access Control

### Sender Role
- **Automatically assigned to**: The person who creates the document
- **Capabilities**:
  - Add signature placeholders for others to sign
  - Assign specific signees to each placeholder
  - Position and resize placeholders as needed
  - Save document with placeholders
- **Cannot**: Sign the document themselves
- **UI Elements**:
  - "Add Signature Placeholder" button (draggable)
  - "Save Document with Placeholders" button
  - Clear instructions on sender capabilities

### Receiver Role
- **Automatically assigned to**: Users who need to sign the document (approvers)
- **Capabilities**:
  - Jump to signature placeholders
  - Sign documents using signature modal
  - Save signed documents
- **Cannot**: Add or modify signature placeholders
- **UI Elements**:
  - "Jump to Signature" button
  - "Sign Document" button
  - "Save Signed Document" button
  - Signature count display

## Workflow

### For Document Senders:
1. **Open E-Sign**: Click "Open E-Sign" button from CreateNewDocument page
2. **Add Placeholders**: Drag "Add Signature Placeholder" button to desired locations
3. **Assign Signees**: Select appropriate signees for each placeholder
4. **Save**: Click "Save Document with Placeholders" to save the document

### For Document Receivers:
1. **Access**: Navigate to e-sign page (typically via notification or direct link)
2. **Review**: See signature placeholders assigned to them
3. **Sign**: Click "Sign Document" to open signature modal
4. **Complete**: Apply signature and save the signed document

## Technical Implementation

### Role Determination
- **URL Parameter**: `userRole` parameter passed from CreateNewDocument
- **Backend Logic**: In production, this would come from authentication context
- **Fallback**: Defaults to "sender" if no role specified

### Data Flow
1. **CreateNewDocument** → **E-Sign Page**: Passes document data, file, and user role
2. **E-Sign Page** → **Backend**: Uploads signed documents via API
3. **Backend** → **CreateNewDocument**: Returns file URL via localStorage

### API Integration
- **Endpoint**: `/api/employee/e-sign-document`
- **Method**: POST
- **Purpose**: Upload and store e-signed PDF documents
- **Response**: Returns file URL for the saved document

## Navigation
- **Back to Dashboard**: Redirects users to their previous page or dashboard
- **Tab Management**: E-sign interface opens in new tab, closes automatically after save

## Security Features
- **Role Validation**: Senders cannot sign documents, only add placeholders
- **Permission Checks**: UI elements are disabled based on user role
- **File Validation**: Only PDF files are supported for e-signing

## Future Enhancements
- **Authentication Integration**: Real user role determination from backend
- **Audit Trail**: Track all signature activities and timestamps
- **Multi-Signature Support**: Handle complex approval workflows
- **Template System**: Pre-defined signature placeholder templates
