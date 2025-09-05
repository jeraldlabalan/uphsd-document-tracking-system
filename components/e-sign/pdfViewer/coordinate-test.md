# Coordinate Transformation Test Guide

## What Was Fixed

The coordinate mismatch issue was caused by using hardcoded scaling factors instead of the actual rendered PDF dimensions. 

### Before (Broken):
```typescript
// ❌ WRONG: Hardcoded scaling
const scaleX = pdfPageWidth / 800; // Assumed 800px width
const scaleY = pdfPageHeight / 1000; // Assumed 1000px height
```

### After (Fixed):
```typescript
// ✅ CORRECT: Use actual rendered dimensions
const renderedPageDims = pageDims[pageIndex];
const scaleX = pdfPageWidth / renderedPageDims.width;
const scaleY = pdfPageHeight / renderedPageDims.height;
```

## How to Test

1. **Upload a PDF document**
2. **Add signature placeholders** by dragging on the document
3. **Check the console logs** for coordinate transformation debug info
4. **Apply signatures** and verify they appear in the correct positions

## Expected Console Output

When you apply signatures, you should see:

```
🔍 COORDINATE TRANSFORMATION DEBUG: [
  {
    placeholderId: 123,
    page: 0,
    storedCoords: { x: 100, y: 200, width: 150, height: 40 },
    renderedPageDims: { width: 800, height: 1132 },
    pdfPageDims: { width: 595, height: 842 },
    transformation: { scaleX: 0.74375, scaleY: 0.74375 },
    pdfCoords: { x: 74.375, y: 662.5, width: 111.5625, height: 29.75 },
    isValid: true,
    isInBounds: true
  }
]
```

## Key Points

- **`renderedPageDims`**: The actual dimensions of the PDF as rendered in the browser
- **`pdfPageDims`**: The original PDF dimensions in points
- **`transformation`**: The scaling factors to convert between coordinate systems
- **`isValid`**: Whether the coordinates are valid (positive values)
- **`isInBounds`**: Whether the signature fits within the PDF page

## Troubleshooting

If coordinates still don't match:

1. **Check if `pageDims` is populated** - this should happen when the PDF loads
2. **Verify page indexing** - ensure frontend and PDF use the same page numbering
3. **Check for CSS scaling** - ensure no additional CSS transforms are applied
4. **Verify PDF dimensions** - check if the PDF has unusual dimensions

## The Math

```
Frontend coordinates → PDF coordinates:
pdfX = frontendX × (pdfWidth / renderedWidth)
pdfY = (renderedHeight - frontendY - frontendHeight) × (pdfHeight / renderedHeight)

Note: Y-coordinate is flipped because:
- Frontend: (0,0) at top-left
- PDF: (0,0) at bottom-left
```
