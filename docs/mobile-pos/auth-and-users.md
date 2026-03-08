## Auth & Users – Supabase Operations

This document explains how **authentication** and **user roles** work for the POS, so the mobile app can log users in, store basic user info, and check roles in the same way as the web app.

Based on:

- `src/services/authService.ts`
- `src/services/userService.ts`
- `src/models/User.ts`

---

### 1. Auth Model & Local User Shape

Client-side `User` model (see `data-models.md`):

```json
{
  "id": "string",          // Supabase auth user id (uuid)
  "username": "staff1",
  "roleId": 1              // 0 = admin, 1 = staff
}
```

**Key conventions**

- **Username-to-email mapping**:
  - Supabase Auth requires an email.
  - The app derives it as: `email = username + "@snackisland.com"`.
- **Profiles table**:
  - There is a `profiles` table storing at least:

```json
{
  "id": "auth-user-uuid",
  "email": "staff1@snackisland.com",
  "roleId": 1,
  "created_at": "2025-02-01T00:00:00Z"
}
```

---

### 2. Sign Up

Function: `authService.signUp(username, password)`

**Supabase call**

```ts
const email = `${username}@snackisland.com`

const { data: authData, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username }
  }
})
```

**Behaviour**

- On success:
  - Returns a `User` object:

```json
{
  "id": "auth-user-uuid",
  "username": "newUser",
  "roleId": 1          // default staff role
}
```

- On error:
  - Returns `{ user: null, error }`.

**Mobile guidance**

- If your mobile app supports user registration:
  - Use the same email convention.
  - Store `username` in user metadata (`options.data`) so it’s available in `authData.user.user_metadata`.

---

### 3. Sign In

Function: `authService.signIn(username, password)`

**Supabase call**

```ts
const email = `${username}@snackisland.com`

const { data: authData, error: authError } =
  await supabase.auth.signInWithPassword({ email, password })
```

On success:

1. Fetch profile to get role:

```ts
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('roleId, email, created_at')
  .eq('id', authData.user.id)
  .single()
```

2. Build client `User`:

```json
{
  "id": "auth-user-uuid",
  "username": "staff1",         // derived from email prefix
  "roleId": 1
}
```

3. Store locally:

```ts
localStorage.setItem('user', JSON.stringify(user))
```

**Mobile guidance**

- Use the equivalent storage for your platform (e.g. secure storage / keychain) to cache:

```json
{ "id": "...", "username": "...", "roleId": 0|1 }
```

- Always refresh `roleId` from the `profiles` table after sign-in to stay in sync with server-side changes.

---

### 4. Sign Out

Function: `authService.signOut()`

**Supabase call**

```ts
const { error } = await supabase.auth.signOut()
```

On success:

- Clears local user:

```ts
localStorage.removeItem('user')
```

Mobile should:

- Call `supabase.auth.signOut()` via the mobile SDK.
- Clear any stored session and cached `User`.

---

### 5. Getting Current User & Role Checks

Client-side helpers in `authService`:

- `getCurrentUser()`
  - Reads the cached user from `localStorage` and parses it.
- `isAuthenticated()`
  - Returns `true` if `getCurrentUser()` is non-null.
- `hasRole(roleId)`
  - Compares `currentUser.roleId` to the given role.
- `isAdmin()`
  - `hasRole(0)`.
- `isStaff()`
  - `hasRole(1)`.

**Mobile guidance**

- Mirror this via:
  - A small user store (or auth provider) that wraps Supabase’s current session.
  - Role checks based on the `roleId` from `profiles`.

---

### 6. Managing Users & Roles (Admin)

Admin operations live in `userService.ts` and operate on the `profiles` table.

#### 6.1 Fetch all users

Function: `userService.getAllUsers()`

**Supabase calls**

1. Ensure the caller is authenticated:

```ts
const { data: { user: currentUser } } = await supabase.auth.getUser()
```

2. Fetch profiles:

```ts
const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, roleId, email, created_at')
```

3. Map to `UserWithProfile`:

```json
{
  "id": "auth-user-uuid",
  "username": "staff1",         // email prefix before '@'
  "email": "staff1@snackisland.com",
  "role": 1,
  "created_at": "2025-02-01T00:00:00Z"
}
```

**Mobile guidance**

- Only expose this in an **admin section** of the app.

#### 6.2 Update user role

Function: `userService.updateUserRole(userId, newRole)`

**Supabase call**

```ts
const { error } = await supabase
  .from('profiles')
  .update({ roleId: newRole })
  .eq('id', userId)
```

**Use cases**

- Promote staff to admin (`newRole = 0`).
- Demote admin to staff (`newRole = 1`).

#### 6.3 Delete user profile

Function: `userService.deleteUser(userId)`

**Supabase call**

```ts
const { error } = await supabase
  .from('profiles')
  .delete()
  .eq('id', userId)
```

**Important**

- This **only deletes the profile row**, not the underlying `auth.users` record.
- Deleting auth users requires admin backend code (not present in this client).

---

### 7. RLS and Permissions (Conceptual)

While the repo doesn’t show explicit Row Level Security policies, the code implies:

- Authenticated users can:
  - Manage orders, order items, and see their own data.
  - Access `profiles` for role information (likely restricted to admins for some operations).
- `roleId` drives:
  - Which UI sections are visible (e.g. user management).
  - Potentially which RPCs/tables are accessible.

For mobile:

- Always:
  - Authenticate with Supabase before calling POS RPCs.
  - Attach the current session to Supabase client calls.
- Use `roleId` to gate:
  - Access to sensitive operations like editing inventory, seeing all users, or changing roles.

---

### 8. Recommended Mobile Auth Flow

1. **Sign in**
   - User enters `username` and `password`.
   - Mobile computes `email = username + "@snackisland.com"`.
   - Call `supabase.auth.signInWithPassword({ email, password })`.
2. **Fetch profile**
   - Query `profiles` for `roleId` and `email`.
   - Derive `username` from `email` prefix if needed.
3. **Cache user**
   - Store `{ id, username, roleId }` securely on device.
4. **Use session**
   - Attach the Supabase client instance with the active session for all RPC/table calls.
5. **On app start**
   - Restore session from Supabase SDK.
   - Restore cached user from secure storage.
6. **On sign out**
   - Call `supabase.auth.signOut()`.
   - Clear cached session and user.

