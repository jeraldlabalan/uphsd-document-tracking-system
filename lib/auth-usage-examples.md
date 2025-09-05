# Authentication Utility Usage Examples

This document shows how to use the new authentication utility functions to protect API routes and ensure deleted users cannot access the system.

## Available Functions

### `verifyAuth(request: NextRequest)`
Verifies that the user is authenticated and their account is not deleted.

### `verifyAdminAuth(request: NextRequest)`
Verifies that the user is authenticated, their account is not deleted, and they have Admin role.

### `verifyEmployeeAuth(request: NextRequest)`
Verifies that the user is authenticated, their account is not deleted, and they have Employee role.

## Usage Examples

### Basic Authentication (Any Role)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if (!authResult) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = authResult;
  // user.UserID, user.email, user.role, user.isDeleted are available
  
  // Your route logic here...
}
```

### Admin-Only Route
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  
  if (!authResult) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { user } = authResult;
  // user.role is guaranteed to be "Admin"
  
  // Your admin-only logic here...
}
```

### Employee-Only Route
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyEmployeeAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await verifyEmployeeAuth(request);
  
  if (!authResult) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { user } = authResult;
  // user.role is guaranteed to be "Employee"
  
  // Your employee-only logic here...
}
```

## Benefits

1. **Automatic Deleted User Check**: All routes using these utilities automatically check if the user account is deleted
2. **Role Verification**: Admin and Employee routes automatically verify the correct role
3. **Consistent Error Handling**: All routes return consistent error responses
4. **Database Fallback**: If JWT verification fails, the utility falls back to database verification
5. **Performance**: JWT verification is fast, database checks are only done when needed

## Migration from Manual JWT Verification

### Before (Manual)
```typescript
const token = request.cookies.get("session")?.value;
if (!token) {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

const decoded = verify(token, process.env.JWT_SECRET!) as any;
if (decoded.role !== "Admin") {
  return NextResponse.json({ error: "Not authorized" }, { status: 403 });
}

// No check for deleted users!
```

### After (Using Utility)
```typescript
const authResult = await verifyAdminAuth(request);
if (!authResult) {
  return NextResponse.json({ error: "Not authorized" }, { status: 401 });
}

const { user } = authResult;
// Automatically checks for deleted users and correct role
```

## Security Features

- **JWT Verification**: Validates JWT tokens and extracts user information
- **Deleted User Check**: Prevents deleted users from accessing any protected routes
- **Role Verification**: Ensures users can only access routes appropriate for their role
- **Database Fallback**: Double-checks user status in database for additional security
- **Error Handling**: Graceful fallback if database checks fail
