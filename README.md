# 💜 LedgerPro — Simple, Friendly & Secure Consumer Banking

**LedgerPro** is a modern, clean, and intuitive FinTech web application inspired by **Google Pay, PhonePe, and Jupiter Money**. Designed for everyday people, it strips away complicated financial jargon and provides a friendly, trustworthy banking experience.

---

## 🎨 Design & Style
* **Clean White UI**: Crisp white and soft slate cards (`bg-white`, `border-slate-100`, soft shadows).
* **Primary Brand Purple**: Signature `#6D28D9` purple primary color with soft lavender tints.
* **Friendly & Accessible**: Consumer-centric terminology — *Money Sent*, *Money Received*, *Accounts*, *Payment Successful*.
* **Mobile-First Responsive Layout**: Smooth desktop header navigation and native-feeling mobile bottom navigation.
* **Balance Privacy**: By default, balances are masked with **"Balance Hidden 🔒"** and can be revealed or hidden with a single tap of the **"Show Balance"** button.

---

## 📱 Pages & Features

### 1. 🔑 Login Page (`/login`)
- Clean white card layout with welcome message.
- Email and password input with show/hide password toggle.
- **1-Click Demo Fill Buttons**: Tap *Akash Sharma* or *Sarah Jenkins* to instantly fill test credentials and explore without typing.
- Direct link to Create Account.

### 2. 📝 Register Page (`/register`)
- Name, Email, Password, and Confirm Password fields with client validation.
- Friendly reassurance and instant ₹10,000 welcome credit for test wallets.
- Fast transition to home upon registration.

### 3. 🏠 Home Dashboard (`/`)
- Warm personalized greeting: `Hello, [User Name] 👋`
- **Account Summary Card**:
  - Masked bank card style with card number suffix (`•••• 0674`).
  - **"Balance Hidden 🔒"** by default with an interactive **"Show Balance"** eye toggle.
  - One-click copy account number button.
- **Quick Action Buttons**:
  - ➕ **Create Account**: Open an additional digital wallet with custom labels.
  - 💸 **Transfer Money**: Quick shortcut to send funds.
  - 📜 **Transactions**: View complete payment activity.
- **Quick Pay Contacts**: Fast avatars (Sarah Jenkins, Akash Sharma, Savings) to send money in one click (similar to PhonePe / Google Pay).
- **Recent Activities Section**: Clean cards showing recent sent and received payments with date and status badges.

### 4. 💳 Accounts Page (`/accounts`)
- List of all digital wallets owned by the user.
- Displays account label, status (`Active` with green dot), and currency (INR ₹).
- Individual balance visibility toggles and global "Show/Hide All" button.
- Clean **"Open New Account"** modal to provision extra wallets for groceries, savings, or travel.

### 5. 💸 Transfer Page (`/transfer`)
- Select sender account from dropdown (displays real-time balance).
- Enter recipient account number (with quick-select shortcuts for contacts).
- Transfer amount with quick preset chips: `+₹500`, `+₹1,000`, `+₹2,000`, `+₹5,000`, and `Max Balance`.
- Optional note/message field (e.g. "Dinner", "Rent").
- Background idempotent transaction execution (zero technical jargon shown to the user).
- **Celebration Success Screen**: Confetti celebration, green checkmark, payment receipt summary, and *Send Another* / *View Receipt* actions.

### 6. 📜 Transaction History Page (`/history`)
- Chronological list of payments.
- Direction indicators: **Money Received** (emerald green with `+₹`) and **Money Sent** (slate with `-₹`).
- Filter tabs: **All Activity**, **Money Sent**, **Received**.
- Real-time search bar to search by account or amount.
- **Payment Receipt Modal**: Tap any transaction to view and print an official clean bank receipt.

### 7. 👤 Profile Page (`/profile`)
- User avatar with initials, full name, email, and verified member badge.
- Count of active linked digital wallets.
- **Privacy & Security Settings**: Toggle default balance visibility on dashboard.
- App version info.
- Prominent secure **Log Out** button with state cleanup.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v3.4, React Router v6, Axios, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express 5, JWT Authentication, Cookie Parser, Resilient In-Memory & MongoDB double-entry storage engine.

---

## 🚀 Running the Application

### Option A: Complete App (Backend + Production React Frontend)
Run the server on port `3000`:
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Frontend Development Server (with Hot Module Replacement)
Run the Vite dev server on port `5173`:
```bash
npm run dev:frontend
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. All `/api` requests are automatically proxied to the backend on port `3000`.

---

## 👥 Demo Test Accounts

| User | Email | Password | Role |
|---|---|---|---|
| **Akash Sharma** | `akash@example.com` | `Password@123` | Primary Member |
| **Sarah Jenkins** | `sarah.j@enterprise.io` | `Password@123` | Payee / Contact |
