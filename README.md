# 📚 LibraryMS - Digital Library Management System

# 📚 Library Management System

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern, full-stack Library Management System built with **Next.js 14+**, **TypeScript**, **Prisma ORM**, and **MongoDB**. This comprehensive web application provides complete library operations including book management, user authentication, admin panel with CRUD operations, and responsive design.

## 🌟 Features

### 🎯 User Feature
- **Book Catalog**: Browse extensive collection with advanced search and filtering
- **User Authentication**: Secure JWT-based login and registration system
- **Profile Management**: Update profile information and change passwords
- **Book Management**: Borrow, return, and renew books with automated tracking
- **Favorites System**: Save and manage favorite books
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Notification Management**: Get notification about borrow requesting and accepting books

### 🛠️ Administrative Features
- **Secure Admin Panel**: Protected admin routes with JWT authentication
- **Complete CRUD Operations**: Full Create, Read, Update, Delete functionality for books
- **Real-time Book Management**: Add, edit, delete books with live database updates
- **Member Management**: Manage user accounts and memberships
- **Transaction Tracking**: Monitor borrowing, returns, and renewals
- **Request Management**: Handle user requests and approvals
- **Analytics Dashboard**: View library statistics and usage reports

### 🎨 Modern UI/UX
- **Professional Design**: Clean, modern interface with excellent typography
- **High Contrast Text**: Improved visibility and accessibility
- **Interactive Elements**: Smooth animations and hover effects
- **Advanced Search**: Real-time search with multiple filter options
- **Efficient Pagination**: Smart content loading and navigation

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **State Management**: React Context API + Hooks

### Backend
- **Database**: Prisma ORM with MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **API Routes**: Next.js API Routes
- **Validation**: Server-side validation

### Development Tools
- **Code Quality**: ESLint, TypeScript compiler
- **Development**: Hot reload, TypeScript IntelliSense
- **Version Control**: Git with proper commit conventions

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- MongoDB database (local or cloud)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vraj2005/nextjs_libraryms_website.git
   cd nextjs_libraryms_website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_mongodb_connection_string"
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET="your_jwt_secret_key"
   
   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Default Admin Credentials
- **Email**: admin@library.com
- **Password**: admin123
- **Access**: `/admin` routes

## 📁 Project Structure
│   └── favicon.ico        # Website favicon
├── src/
│       ├── globals.css    # Global styles
│       ├── layout.tsx     # Root layout component
│       ├── page.tsx       # Home page with carousel
│       ├── about/         # About page
│       ├── admin/         # Admin dashboard
│       │   ├── books/     # Book management
│       │   ├── dashboard/ # Admin dashboard
│       │   ├── login/     # Admin authentication
│       │   ├── members/   # Member management
│       │   ├── reports/   # Analytics and reports
│       │   └── transactions/ # Transaction tracking
│       ├── books/         # Book catalog
│       ├── borrowed/      # Borrowed books management
│       ├── contact/       # Contact information
│       ├── favorites/     # User favorites
│       ├── login/         # User authentication
│       ├── profile/       # User profile
│       └── register/      # User registration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
└── README.md              # Project documentation
```

```
nextjs_libraryms_website/
├── public/                  # Static assets
│   ├── *.svg                # Book icons and illustrations
│   └── favicon.ico          # Website favicon
├── src/
│   └── app/                 # Next.js App Router
│       ├── globals.css      # Global styles
│       ├── layout.tsx       # Root layout component
│       ├── page.tsx         # Home page with carousel
│       ├── about/           # About page
│       ├── admin/           # Admin dashboard
│       │   ├── books/       # Book management
│       │   ├── dashboard/   # Admin dashboard
│       │   ├── login/       # Admin authentication
│       │   ├── members/     # Member management
│       │   ├── reports/     # Analytics and reports
│       │   └── transactions/# Transaction tracking
│       ├── books/           # Book catalog
│       ├── borrowed/        # Borrowed books management
│       ├── contact/         # Contact information
│       ├── favorites/       # User favorites
│       ├── login/           # User authentication
│       ├── profile/         # User profile
│       └── register/        # User registration
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
└── README.md                # Project documentation
```

## � Performance & Best Practices

### Code Quality
- **TypeScript**: Full type safety and enhanced developer experience
- **ESLint**: Code quality enforcement and consistent formatting
- **Tailwind CSS**: Utility-first CSS for rapid, consistent styling
- **Component Architecture**: Modular, reusable component design

### Performance Optimizations
- **Next.js App Router**: Optimized routing and rendering
- **Server-Side Rendering**: Fast initial page loads
- **API Route Optimization**: Efficient database queries with Prisma
- **Image Optimization**: Next.js automatic image optimization

### Database Performance
- **Prisma ORM**: Type-safe database operations
- **MongoDB**: Scalable NoSQL database with flexible schema
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized database queries for performance

## 🔧 Development & Deployment

### Development Workflow
1. **Local Development**: Hot reloading with `npm run dev`
2. **Type Checking**: TypeScript compilation and type validation
3. **Linting**: ESLint for code quality and consistency
4. **Testing**: Component and API testing capabilities

### Deployment Options
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Alternative hosting with easy deployment
- **Docker**: Containerized deployment for any platform
- **Traditional Hosting**: Static export capabilities

### Environment Management
- Development, staging, and production configurations
- Environment variable management for security
- Database URL configuration for different environments
- JWT secret management for secure authentication

## �🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npx prisma studio` - Open Prisma database browser
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## 🏗️ Project Architecture

### Database Schema (Prisma)  
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Book {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  author      String
  isbn        String   @unique
  category    String
  image       String
  copies      Int      @default(1)
  available   Int      @default(1)
  borrowed    Int      @default(0)
  reserved    Int      @default(0)
  location    String?
  callNumber  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Routes Structure
```
/api/
├── auth/
│   ├── login      # POST - User authentication
│   └── register   # POST - User registration
├── books/         # GET, POST, PUT, DELETE - CRUD operations
├── users/         # GET, PUT - User management
└── admin/         # Admin-specific endpoints
```

## 🎯 Key Features & Pages

### 🔐 Authentication System
- **JWT-based Authentication**: Secure token-based user sessions
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access**: User and Admin role management
- **Protected Routes**: Admin routes require authentication
- **Auto-logout**: Session management with expiration

### 📖 User Pages
- **Home** (`/`) - Interactive library overview with modern design
- **Books** (`/books`) - Complete book catalog with search/filter
- **Profile** (`/profile`) - User dashboard with password change functionality
- **Login/Register** (`/login`, `/register`) - Secure authentication forms

### 🛠️ Admin Panel (Protected Routes)
- **Dashboard** (`/admin/dashboard`) - Overview and statistics
- **Books Management** (`/admin/books`) - Complete CRUD operations:
  - ✅ **Create**: Add new books with form validation
  - ✅ **Read**: View all books with search, filter, and pagination
  - ✅ **Update**: Edit book details with pre-filled forms
  - ✅ **Delete**: Remove books with confirmation dialogs
- **Members** (`/admin/members`) - User account management
- **Transactions** (`/admin/transactions`) - Borrowing history tracking
- **Requests** (`/admin/requests`) - Handle user requests
- **Reports** (`/admin/reports`) - Analytics and insights

### 🎨 Design Features
- **High Contrast UI**: Improved text visibility and accessibility
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Smooth hover effects and transitions
- **Form Validation**: Client-side and server-side validation
- **Real-time Updates**: Live data updates without page refresh
- **Professional Typography**: Clear, readable fonts and spacing

## 💾 Data Management & CRUD Operations

### Backend Implementation
- **Database**: MongoDB with Prisma ORM for type-safe database access
- **API Routes**: RESTful endpoints built with Next.js API routes
- **Data Validation**: Server-side validation for all operations
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Books CRUD Operations
```typescript
// Create - Add new book
POST /api/books
{
  title: string,
  author: string,
  isbn: string,
  category: string,
  copies: number,
  location?: string
}

// Read - Get all books with filters
GET /api/books?search=...&category=...&status=...

// Update - Edit existing book
PUT /api/books
{
  id: string,
  title: string,
  author: string,
  // ... other fields
}

// Delete - Remove book
DELETE /api/books
{ id: string }
```

### Authentication Flow
```typescript
// User Registration
POST /api/auth/register
{ name, email, password }

// User Login
POST /api/auth/login
{ email, password }
// Returns: JWT token for authenticated requests

// Protected Admin Routes
Authorization: Bearer <jwt-token>
```

### State Management
- **React Context**: Global authentication state
- **Local State**: Component-level state with hooks
- **Form Handling**: Controlled components with TypeScript
- **Real-time Updates**: Optimistic UI updates

## 🔐 Authentication & Security

### Security Features
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Password Hashing**: bcryptjs with salt for secure password storage
- **Protected Routes**: Server-side authentication verification
- **Role-based Access**: User and Admin role separation
- **Input Validation**: Sanitization and validation of user inputs

### User Authentication
- **Registration**: Email-based account creation with validation
- **Login**: Secure authentication with session management
- **Profile Management**: Users can update profile and change passwords
- **Auto-logout**: Token expiration handling

### Admin Authentication
- **Separate Admin Access**: Protected `/admin` routes
- **JWT Verification**: All admin operations require valid tokens
- **CRUD Permissions**: Only authenticated admins can modify data
- **Session Security**: Automatic logout on token expiration

## 📱 Responsive Design & Accessibility

### Mobile-First Approach
- **Responsive Layouts**: Optimized for all screen sizes
- **Touch-Friendly**: Large tap targets and gesture support
- **Performance**: Optimized loading and smooth animations

### Accessibility Features
- **High Contrast Text**: Improved readability with bold, dark text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Form Validation**: Clear error messages and field requirements

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Static site hosting with serverless functions
- **Railway**: Full-stack application hosting
- **DigitalOcean**: VPS hosting with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

For support, email support@libraryms.com or join our community Discord server.

## 🚧 Future Enhancements

### Planned Features
- [ ] **Real-time Notifications**: Live updates for book availability and due dates
- [ ] **Advanced Analytics**: Library usage statistics and reporting dashboard
- [ ] **Barcode Scanning**: Mobile barcode scanning for quick book operations
- [ ] **Multi-language Support**: Internationalization for global accessibility
- [ ] **Dark Mode Theme**: User preference-based theme switching
- [ ] **Mobile App**: React Native companion app for mobile users
- [ ] **Integration APIs**: Connect with external library catalogs and systems
- [ ] **Automated Reminders**: Email/SMS notifications for overdue books

### Technical Improvements
- [ ] **Unit Testing**: Comprehensive test coverage with Jest and Testing Library
- [ ] **Performance Monitoring**: Real-time performance analytics and monitoring
- [ ] **Cache Management**: Redis integration for improved performance
- [ ] **Advanced Security**: Two-factor authentication and enhanced security measures

## 📊 Project Statistics

- **Lines of Code**: 2,000+ (TypeScript, TSX, CSS)
- **Components**: 15+ reusable React components
- **API Routes**: 10+ RESTful endpoints
- **Database Models**: User, Book, Transaction entities
- **Authentication**: JWT-based secure authentication system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

---

**⭐ If you find this project helpful, please consider giving it a star!**

**🔗 Project Demo**: [Live Demo](https://your-demo-url.vercel.app) | **📖 Documentation**: [Wiki](https://github.com/vraj2005/library-management-system/wiki)

Built with ❤️ by [vraj2005](https://github.com/vraj2005) using modern web technologies.
