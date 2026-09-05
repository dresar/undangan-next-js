# Digital Invitation Website Builder

A WYSIWYG editor for creating mobile-first digital invitations.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- MySQL (Database)
- Styled Components
- Zustand (State Management)
- @dnd-kit (Drag & Drop)
- react-rnd (Resizing)
- Framer Motion (Animations)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MySQL Database

Pastikan MySQL sudah terinstall dan berjalan. Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=undangan
```

### 3. Initialize Database

Jalankan script untuk membuat database dan tabel:

```bash
npm run init-db
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

