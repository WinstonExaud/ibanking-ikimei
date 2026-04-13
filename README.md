# iKIMEI Banking System

A production-level internal banking web application built with **React + Vite + Tailwind CSS v3 + Firebase**.

Designed to match the premium fintech UI style of Banksin/Revolut — clean light theme, soft shadows, Poppins/Inter typography.

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Backend | Firebase (Auth + Firestore) |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Sounds | Web Audio API (no files needed) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── cards/         # StatCard, BankCard, AccountCard
│   ├── charts/        # MoneyFlowChart
│   ├── layout/        # Sidebar, Topbar, BottomNav
│   └── ui/            # Modal, TransactionRow, DepositModal,
│                        TransferModal, CreateAccountModal,
│                        CreateClientModal, ReceiptModal
├── context/           # AuthContext, ToastContext
├── pages/
│   ├── banker/        # DashboardHome, AccountsPage,
│   │                    TransactionsPage, AnalyticsPage,
│   │                    ClientsPage, SettingsPage
│   ├── LoginPage.jsx
│   ├── BankerDashboard.jsx
│   └── ClientDashboard.jsx
├── services/          # firebase.js, bankingService.js
└── utils/             # helpers.js, sounds.js
```

---

## ⚙️ Firebase Setup

### Step 1 — Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `ikimei-banking`)
3. Enable **Authentication → Email/Password**
4. Create **Firestore Database** (start in production mode)

### Step 2 — Get Config

In Firebase Console → Project Settings → Your Apps → Web App, copy the config object.

### Step 3 — Update Config File

Edit `src/services/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4 — Deploy Firestore Security Rules

Copy the contents of `firestore.rules` into your Firestore Rules tab, then publish.

### Step 5 — Create Banker Account

In Firebase Console → Authentication → Add user:
- Email: `banker@ikimei.com`
- Password: `your-secure-password`

Then in Firestore → `users` collection, create a document with the **same UID** as the Firebase Auth user:

```json
{
  "name": "Admin Banker",
  "email": "banker@ikimei.com",
  "role": "banker",
  "balance": 0,
  "accountId": "IKM-BANKER-001",
  "createdAt": <timestamp>
}
```

> ⚠️ The `role: "banker"` field is required. Without it, the user will be redirected to client view.

---

## 🧱 Firestore Data Structure

### `users/{uid}`
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "role": "client",
  "balance": 500000,
  "accountId": "IKMABC123",
  "createdAt": Timestamp
}
```

### `accounts/{id}`
```json
{
  "name": "James Cement",
  "balance": 4200000,
  "color": "#EA580C",
  "createdAt": Timestamp
}
```

### `transactions/{id}`
```json
{
  "fromAccountId": "account-doc-id",
  "toUserId": "user-uid-or-null",
  "amount": 500000,
  "type": "deposit | transfer",
  "status": "completed",
  "note": "Monthly payment",
  "createdAt": Timestamp
}
```

### `system/totals`
```json
{
  "totalBalance": 9800000
}
```

---

## 🖥️ Installation & Running

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Roles

| Feature | Banker | Client |
|---------|--------|--------|
| View dashboard | ✅ | ✅ (own) |
| View all accounts | ✅ | ❌ |
| Deposit to account | ✅ | ❌ |
| Transfer to client | ✅ | ❌ |
| Create client | ✅ | ❌ |
| Create account | ✅ | ❌ |
| View analytics | ✅ | ❌ |
| View own balance | ✅ | ✅ |
| View own transactions | ✅ | ✅ |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#F5F7FB` |
| Card | `#FFFFFF` |
| Primary | `#2563EB` |
| Success | `#22C55E` |
| Danger | `#EF4444` |
| Border | `#E8ECF4` |
| Heading font | Poppins |
| Body font | Inter |
| Border radius | 16–24px |

---

## 🔊 Sound System

Sounds are generated using the **Web Audio API** — no external files needed.

- **Login** → ascending tone
- **Success** → C-E-G chord
- **Error** → descending sawtooth
- **Info** → single tone
- **Warning** → double pulse

---

## 📱 Mobile Support

- Sidebar collapses on mobile → replaced by bottom navigation bar
- Cards stack vertically on small screens
- Touch-friendly tap targets (min 44px)
- Responsive grid layouts

---

## 🚀 Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Or drag the `dist/` folder (after `npm run build`) into [https://vercel.com/new](https://vercel.com/new).

---

## 🛠️ Customization

### Add a new account color
Edit `src/utils/helpers.js` → `getAccountColor()` function.

### Change currency
Edit `src/utils/helpers.js` → `formatCurrency()` — change `'TZS'` to your currency code.

### Add a new page (banker)
1. Create `src/pages/banker/NewPage.jsx`
2. Add route in `src/pages/BankerDashboard.jsx`
3. Add sidebar link in `src/components/layout/Sidebar.jsx`

---

## 📄 License

Built for iKIMEI / Zentrya Limited. Internal use only.
