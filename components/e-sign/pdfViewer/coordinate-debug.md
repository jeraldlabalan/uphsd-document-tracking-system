# Y-Coordinate Debug Guide

## The Problem
Your signature is appearing **below** the placeholder instead of **on top** of it.

## What's Happening
Looking at your logs:
- **Placeholder Y**: 734.56
- **Page Height**: 936
- **Placeholder Height**: 40
- **Calculated PDF Y**: 161.44

## The Math
```
PDF Y = Page Height - Placeholder Y - Placeholder Height
PDF Y = 936 - 734.56 - 40 = 161.44
```

## Why This Happens
1. **Frontend coordinates**: (0,0) is at **top-left**
2. **PDF coordinates**: (0,0) is at **bottom-left**
3. **Y-coordinate flip**: We need to "flip" the Y-axis

## The Fix
The current transformation is correct, but let's verify:

```typescript
// This should work:
const pdfY = (renderedPageDims.height - placeholderToSign.y - placeholderToSign.height) * scaleY;

// For your example:
// pdfY = (936 - 734.56 - 40) * 1 = 161.44
```

## Debug Steps
1. **Check the new console logs** - you should see `🔍 Y-COORDINATE DEBUG`
2. **Verify the calculation** - the math should match
3. **Check if scaling is correct** - `scaleY` should be 1 in your case

## Expected Result
- **Placeholder at Y=734** (top of page)
- **Signature at Y=161** (bottom of page, but correctly positioned)
- **The signature should appear exactly where the placeholder is**

## If Still Wrong
The issue might be:
1. **CSS transforms** affecting the PDF viewer
2. **Page scaling** not being accounted for
3. **Coordinate system mismatch** between React-PDF and your placeholders

## Test This
1. Create a placeholder at the very top (Y=0)
2. Check if signature appears at the very bottom (Y=pageHeight-height)
3. Create a placeholder at the very bottom (Y=pageHeight-height)
4. Check if signature appears at the very top (Y=0)

This will confirm if the coordinate system is working correctly.
