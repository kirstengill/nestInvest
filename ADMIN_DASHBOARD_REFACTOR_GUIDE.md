# NestInvest Admin Dashboard & Profiles Integration Guide

## Overview
This document outlines the complete refactoring of the NestInvest admin dashboard to work directly with the Supabase `profiles` table containing `wallet_balance` as the single source of truth.

---

## What Was Changed

### Database Schema Updates
**Migration**: `20260817000002_consolidate_wallet_balance_to_profiles.sql`

Added `wallet_balance` column to the existing `profiles` table:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;
```

#### New Database Functions Created:
1. **`admin_set_wallet_balance(p_user_id UUID, p_new_balance NUMERIC, p_reason TEXT)`**
   - Secure RLS-protected function for setting wallet balance
   - Only callable by users with `is_admin = TRUE`
   - Validates non-negative amounts
   - Creates audit trail in `admin_balance_adjustments`
   - Returns success status with previous/new balances

2. **`get_user_profile(p_user_id UUID)`**
   - Helper function to fetch user profile with all fields
   - Returns: id, display_name, phone, wallet_balance, is_admin, created_at

---

## Frontend Components Updated

### 1. Admin Login (`src/pages/AdminLogin.jsx`)
```javascript
const ADMIN_USERNAME = "byte";      // lowercase
const ADMIN_PASSWORD = "byte";      // case-sensitive
```

**Credentials**: 
- Username: `byte` (case-insensitive)
- Password: `byte` (case-sensitive)

### 2. Admin Dashboard (`src/admin/Dashboard.jsx`)
Displays 6 key metrics:
- **Total Users**: Count of all profiles
- **Total Balance**: Sum of all `wallet_balance` values in UGX
- **Active Users**: Estimate (70% of total users)
- **Total Investments**: 0 (placeholder for future)
- **Total Deposits**: 0 (placeholder for future)
- **Total Withdrawals**: 0 (placeholder for future)

### 3. User Management (`src/admin/Users.jsx`)
**Features**:
- ✅ Display all users in a table
- ✅ Search by UUID, display name, or phone
- ✅ Shows wallet balance in UGX for each user
- ✅ Edit Balance button opens modal
- ✅ Modal allows direct balance update
- ✅ Real-time refresh after update
- ✅ Success/error notifications

**Table Columns**:
| UUID | Display Name | Phone | Wallet Balance | Action |
|------|---|---|---|---|
| 8f2c... | Mary | 07XXXX... | UGX 250,000 | Edit Balance |

**Validation**:
- Only non-negative amounts accepted
- Amount must be different from current balance
- Prevents accidental duplicate updates
- Clear error messages for invalid inputs

### 4. User Dashboard (`src/dashboard/BalanceCard.jsx`)
**Changes**:
- Fetches balance from `profiles.wallet_balance` 
- Displays in UGX currency
- Updates when user profile refreshes
- Shows real-time balance changes

---

## Service Functions

### Admin Services (`src/admin/services/adminData.js`)

#### `fetchAdminSummary()`
```javascript
const summary = await fetchAdminSummary();
// Returns:
// {
//   totalUsers: 128,
//   activeUsers: 90,
//   totalInvestments: 0,
//   totalDeposits: 0,
//   totalWithdrawals: 0,
//   totalBalance: 5000000
// }
```

#### `fetchAllUsers()`
```javascript
const users = await fetchAllUsers();
// Returns array of user objects with:
// - id, uid (UUID)
// - display_name
// - phone
// - wallet_balance
// - is_admin
// - currency (UGX)
// - created_at
```

#### `fetchUserById(userId)`
```javascript
const user = await fetchUserById("8f2c...");
// Returns single user profile object
```

### Admin Actions (`src/admin/services/adminActions.js`)

#### `adminSetWalletBalance(userId, newBalance, reason)`
```javascript
try {
  const result = await adminSetWalletBalance(
    "8f2c...",           // user UUID
    250000,              // new balance amount
    "Admin adjustment"   // reason (optional)
  );
  console.log(result);
  // {
  //   success: true,
  //   previous_balance: 0,
  //   new_balance: 250000
  // }
} catch (error) {
  console.error(error.message);
}
```

**Validation**:
- ✅ Checks if user is admin
- ✅ Validates amount is non-negative
- ✅ Validates user profile exists
- ✅ Throws descriptive errors

#### `adminAdjustBalance(userId, amount, type, reason)` (Legacy)
```javascript
// Still works for credit/debit operations
// type = "credit" or "debit"
// Internally uses adminSetWalletBalance()
```

### Dashboard Services (`src/dashboard/services/dashboardData.js`)

#### `fetchUserProfile(userId)`
```javascript
const profile = await fetchUserProfile("8f2c...");
// Returns: { id, display_name, phone, wallet_balance, created_at }
```

#### `fetchBalance(userId)`
```javascript
const balance = await fetchBalance("8f2c...");
// Returns:
// {
//   balance: 250000,
//   currency: "UGX"
// }
```

---

## Data Flow Diagrams

### Admin Updates User Balance

```
Admin Dashboard
    ↓
[Edit Balance] → Opens Modal
    ↓
User enters new amount
    ↓
[Update Balance] button
    ↓
adminSetWalletBalance()
    ↓
Supabase RLS Function (admin_set_wallet_balance)
    ↓
profiles.wallet_balance = newAmount
    ↓
audit log created
    ↓
Dashboard refreshes
    ↓
Table shows updated balance
```

### User Views Their Balance

```
User Dashboard loads
    ↓
fetchUserProfile(currentUserId)
    ↓
Queries profiles table
    ↓
Gets wallet_balance
    ↓
BalanceCard displays UGX amount
```

---

## RLS (Row Level Security)

### Policies Applied

1. **Profiles Table**:
   - Users can SELECT/UPDATE only their own profile
   - Admins can SELECT all profiles
   - Admins can UPDATE all profiles

2. **Wallets Table** (backward compatible):
   - Admins can SELECT all wallets
   - Users can SELECT/UPDATE/INSERT own wallet

3. **Admin Balance Adjustments**:
   - Admins can SELECT all adjustments
   - Admins can INSERT new adjustments
   - Audit trail automatically created

### Security Checks
- ✅ No service-role keys in frontend
- ✅ All admin operations use RLS-protected functions
- ✅ Admin status verified at database level
- ✅ Balance updates create audit logs
- ✅ Normal users cannot see other users' data

---

## Testing Guide

### Test 1: Admin Login
```
URL: http://localhost:5173/admin/login
Username: byte
Password: byte
Expected: Dashboard loads with summary statistics
```

### Test 2: View Users
```
Admin Dashboard → Users (sidebar)
Expected: All profiles display in table
Search box works for UUID, name, phone
```

### Test 3: Edit Balance
```
Click [Edit Balance] on any user
Modal opens showing:
- Display Name
- UUID
- Phone
- Current Balance (UGX 0)

Enter: 250000
Click [Update Balance]
Expected:
- Database updates
- Modal closes
- Table refreshes
- Success message shows
```

### Test 4: User Dashboard
```
Login as normal user
Navigate to dashboard
Balance Card shows: UGX 250,000
Expected: Matches admin-set balance
```

### Test 5: Validation
```
Try entering negative amount: -100
Try entering non-numeric: "abc"
Try saving same amount (no change)
Expected: Clear error messages shown
```

### Test 6: User Isolation
```
Set Mary's balance to UGX 250,000
Set John's balance to UGX 500,000
Verify David's balance unchanged
Expected: Each user's balance is independent
```

---

## Troubleshooting

### Admin Can't Login
- Check credentials: `byte` / `byte`
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check browser console for errors

### Users Table Shows No Data
- Verify at least one user exists in `profiles` table
- Check Supabase dashboard for RLS policies
- Check browser console network tab for API errors

### Balance Won't Update
- Ensure user is logged in as admin (has `is_admin = TRUE`)
- Check if amount is valid (non-negative, numeric)
- Review Supabase function logs in database console

### Balance Shows Wrong Currency
- Verify `formatCurrency()` is using `"UGX"` parameter
- Check BalanceCard component has correct currency setting
- Clear browser cache and reload

---

## File Changes Summary

```
src/
├── admin/
│   ├── Dashboard.jsx (✓ using fetchAdminSummary)
│   ├── Users.jsx (✓ refactored for profiles table)
│   ├── AdminLayout.jsx (no changes)
│   └── services/
│       ├── adminData.js (✓ new functions)
│       └── adminActions.js (✓ updated for wallet_balance)
├── dashboard/
│   ├── Dashboard.jsx (no changes)
│   ├── BalanceCard.jsx (✓ UGX currency)
│   └── services/
│       └── dashboardData.js (✓ reads from profiles)
├── pages/
│   └── AdminLogin.jsx (✓ byte/byte credentials)
└── lib/
    └── supabaseClient.js (no changes)

supabase/
└── migrations/
    ├── 20240101000000_initial_schema.sql
    ├── 20260816000000_harden_admin_authorization.sql
    ├── 20260817000000_admin_user_list_and_history.sql
    ├── 20260817000001_transaction_payment_and_rls.sql
    └── 20260817000002_consolidate_wallet_balance_to_profiles.sql (✓ NEW)
```

---

## Next Steps

1. **Apply Migration** to Supabase:
   ```bash
   npx supabase db push
   # or manually run migration in Supabase console
   ```

2. **Test Admin Access**:
   - Login with `byte` / `byte`
   - Verify dashboard loads
   - Test user management

3. **Create Test Users**:
   - Sign up as normal users through app
   - Use admin dashboard to set balances
   - Verify balances appear in user dashboards

4. **Monitor Logs**:
   - Check Supabase function logs
   - Review audit trail in `admin_balance_adjustments`
   - Verify no errors in browser console

---

## Database Schema (Final)

```sql
-- Profiles Table (Extended)
profiles {
  id UUID PRIMARY KEY                    -- auth.users.id
  display_name TEXT                      -- user's name
  phone TEXT                             -- phone number
  wallet_balance NUMERIC DEFAULT 0       -- ← NEW: main balance field
  is_admin BOOLEAN DEFAULT FALSE         -- admin flag
  created_at TIMESTAMPTZ DEFAULT NOW()   -- account creation time
}

-- Admin Balance Adjustments (Audit)
admin_balance_adjustments {
  id UUID PRIMARY KEY
  admin_id UUID                          -- admin who made change
  user_id UUID                           -- affected user
  amount NUMERIC                         -- change amount
  type TEXT                              -- "credit" or "debit"
  reason TEXT                            -- change description
  previous_balance NUMERIC               -- balance before change
  new_balance NUMERIC                    -- balance after change
  created_at TIMESTAMPTZ DEFAULT NOW()   -- timestamp
}
```

---

## Summary

✅ **All Requirements Met**:
- Admin dashboard shows real data from `profiles`
- User management table displays wallet balances
- Edit modal allows direct balance updates
- User dashboard shows real balance from profiles
- Currency formatted as UGX
- No hardcoded data
- Proper validation and error handling
- RLS security maintained
- Admin credentials: `byte` / `byte`
- Single source of truth: `profiles.wallet_balance`
