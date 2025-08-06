# Swift-Books Implementation Chunks

## How to Use This File

For each chunk, open a new Claude chat and use this prompt:

```
I have a Swift-Books project at: C:\Users\adhia\OneDrive\Documents\GitHub\swift-books

Please implement [CHUNK LETTER] from the IMPLEMENTATION_CHUNKS.md file in the root directory.

Read the relevant files, implement the chunk completely, and give me the full code to update/create.
```

---

## CHUNK A: Database Performance & Security Fix

**Priority**: 🔴 CRITICAL  
**Files to Read**: 
- `supabase/migrations/` (all existing migrations)
- Check latest migration timestamp

**Implementation Required**:
```sql
-- Create new migration file: supabase/migrations/[timestamp]_performance_security_fix.sql

1. Fix RLS policies - move auth.uid() calls outside row evaluation
2. Set email OTP expiry to 30 minutes
3. Enable leaked password protection
4. Create indexes for commonly queried fields
5. Consolidate permissive policies on expense_categories
```

**Success Criteria**: 
- All Supabase warnings resolved
- Query performance improved by 50%

---

## CHUNK B: Receipt OCR Storage Fix

**Priority**: 🔴 CRITICAL  
**Files to Read**: 
- `src/components/receipt-upload-enhanced.tsx`
- `supabase/functions/process-receipt-ocr/index.ts`
- Check Supabase storage bucket settings

**Implementation Required**:
```typescript
1. Fix image URL generation with proper signed URLs
2. Add image display component after upload
3. Create thumbnail generation for performance
4. Add retry logic for OCR failures
5. Implement proper error boundaries
6. Ensure images are actually visible in the UI
```

**Success Criteria**: 
- Uploaded receipt images display immediately
- Thumbnails load quickly
- OCR processes successfully

---

## CHUNK C: Canadian Tax Engine

**Priority**: 🟡 HIGH  
**Files to Read**: 
- `src/lib/tax-calculator.ts`

**Implementation Required**:
```typescript
// Create new: src/lib/canadian-tax-engine.ts

1. Complete provincial tax calculator:
   - BC: GST 5% + PST 7%
   - AB: GST 5%
   - ON: HST 13%
   - QC: GST 5% + QST 9.975%
   - NS, NB, NL, PE: HST 15%
   - MB, SK: GST 5% + PST 6%/7%

2. Transaction-based tax determination
3. Home province vs transaction province logic
4. Tax remittance calculator with deadlines
5. ITC (Input Tax Credit) calculator
```

**Success Criteria**: 
- Accurate tax for all provinces
- Proper ITC calculations
- Remittance deadline alerts

---

## CHUNK D: Bank Ledger System

**Priority**: 🟡 HIGH  
**Files to Read**: 
- `src/pages/Banking.tsx`
- `src/pages/Expenses.tsx`
- `src/pages/Index.tsx` (for navigation)

**Implementation Required**:
```typescript
// Create new: src/pages/Ledger.tsx
// Create new: src/components/ledger/

1. Bank statement-style transaction view
2. Running balance calculator
3. One-click reconciliation
4. Merge expenses/income in real-time
5. Double-entry bookkeeping
6. Replace current Banking.tsx with this
```

**Success Criteria**: 
- Looks like a bank statement
- Running balance always accurate
- One-click reconciliation works

---

## CHUNK E: Design System Replacement

**Priority**: 🟢 MEDIUM  
**Files to Read**: 
- `src/index.css`
- `tailwind.config.ts`
- `src/App.tsx`

**Implementation Required**:
```typescript
1. Install Chakra UI
2. Remove Tailwind classes from all components
3. Create consistent color theme:
   - Primary: #2B6CB0 (Trust Blue)
   - Secondary: #1A365D
   - Success: #38A169
   - Background: #F7FAFC (light) / #1A202C (dark)
4. Fix dark/light mode toggle
5. Add smooth transitions
```

**Success Criteria**: 
- Consistent colors throughout
- Dark mode works properly
- Modern fintech aesthetic

---

## CHUNK F: Navigation & Layout Redesign

**Priority**: 🟢 MEDIUM  
**Files to Read**: 
- `src/App.tsx`
- `src/components/ui/sidebar.tsx`
- All files in `src/pages/`

**Implementation Required**:
```typescript
1. Simplify navigation to:
   - Dashboard
   - Transactions (merged Expenses + Invoices + Receipts)
   - Reports
   - Settings

2. Remove redundant pages
3. Create widget system for dashboard
4. Add keyboard shortcuts
5. Update routing
```

**Success Criteria**: 
- Clean, simple navigation
- No duplicate functionality
- Customizable dashboard

---

## CHUNK G: Plaid Banking Integration

**Priority**: 🔵 MEDIUM  
**Files to Read**: 
- `src/components/banking/bank-integration.tsx`

**Implementation Required**:
```typescript
// Create new: src/lib/plaid/
// Create new: supabase/functions/sync-bank-transactions/

1. Plaid Link implementation
2. Account connection flow
3. Daily transaction sync
4. Balance reconciliation
5. Multi-bank support
```

**Success Criteria**: 
- Connect to any Canadian bank
- Transactions sync automatically
- Balances match bank

---

## CHUNK H: Communication Layer

**Priority**: 🔵 MEDIUM  
**Files to Read**: 
- `supabase/functions/send-invoice/index.ts`
- `supabase/functions/generate-invoice-pdf/index.ts`

**Implementation Required**:
```typescript
1. SendGrid integration (use process.env.SENDGRID_API_KEY)
2. jsPDF installation and setup
3. Invoice PDF generation
4. Payment reminders
5. Client portal links
```

**Success Criteria**: 
- Invoices send via email
- PDFs generate properly
- Reminders send automatically

---

## CHUNK I: AI Business Intelligence

**Priority**: ⚪ LOW  
**Files to Read**: 
- `src/components/ai/ai-chat.tsx`
- `supabase/functions/ai-business-insights/index.ts`

**Implementation Required**:
```typescript
// Create new: src/components/insights/

1. Cash flow predictions
2. Expense anomaly detection
3. Tax optimization suggestions
4. Business health score
5. Actionable recommendations
```

**Success Criteria**: 
- Accurate predictions
- Useful insights
- Clear action items

---

## CHUNK J: Smart Categorization Enhancement

**Priority**: ⚪ LOW  
**Files to Read**: 
- `src/components/ai/expense-categorizer.tsx`

**Implementation Required**:
```typescript
1. Vendor memory system
2. Recurring expense detection
3. Split transaction handling
4. Category confidence scores
5. Learning from corrections
```

**Success Criteria**: 
- 95%+ categorization accuracy
- Learns from user behavior

---

## CHUNK K: Mock Data Removal

**Priority**: ⚪ LOW  
**Files to Read**: 
- All component files (scan for hardcoded data)

**Implementation Required**:
```typescript
1. Remove all hardcoded values
2. Add loading states
3. Add empty states
4. Create demo seed data
5. Add data validation
```

**Success Criteria**: 
- No mock data in production
- Proper loading/empty states

---

## CHUNK L: Performance Optimization

**Priority**: ⚪ LOW  
**Files to Read**: 
- `vite.config.ts`
- `src/main.tsx`
- `src/App.tsx`

**Implementation Required**:
```typescript
1. Code splitting
2. Lazy loading routes
3. Image optimization
4. Query caching
5. Virtual scrolling
```

**Success Criteria**: 
- 50% faster initial load
- Smooth scrolling on mobile

---

## Testing After Each Chunk

1. Run: `npm run dev`
2. Test at: http://localhost:5173
3. Login with test credentials
4. Verify chunk functionality
5. Commit to git with message: "Implement Chunk [X]: [Description]"

---

## Notes

- Each chunk is independent
- Can be implemented in any order (except priorities)
- Test thoroughly before moving to next chunk
- Keep existing functionality working
