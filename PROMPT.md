# Lattice Code Pro Team - Complete Application Prompt

Create a comprehensive team management and activity tracking system called **"Lattice Code Pro Team - Management System"** with the following specifications:

## **Tech Stack Requirements**
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with modern design
- **Database**: Supabase (PostgreSQL with RLS)
- **Icons**: Lucide React
- **Authentication**: Custom auth with bcryptjs
- **Build Tool**: Vite with hot reload

## **Core Features & Pages**

### **1. Authentication System**
- Custom login form with email/password
- Role-based access control (admin, member, viewer)
- Password change functionality
- Profile management
- Default admin account: `mirza.ovi8@gmail.com` / `P@ssw0rd#2025InvoiceGen`
- Default member accounts with password: `demo123`

### **2. Activity Logs Management**
- **Main dashboard** with comprehensive activity logging
- **Filter system**: Date range, workers, projects with active filter tags
- **CRUD operations**: Add, edit, delete activity logs
- **CSV Import/Export**: Template download and bulk import
- **Bulk operations**: Multi-select and bulk delete (admin only)
- **Statistics**: Total logs, hours, projects, workers
- **Responsive table/card view** for mobile

### **3. Team Status Tracking**
- **Real-time status updates**: Active, Available for Work, Not Available
- **Visual status indicators** with colored dots and backgrounds
- **Timezone support**: Bangladesh (BST) and Slovakia (CET) time zones
- **Last updated timestamps** formatted by selected timezone
- **Status change permissions**: Members can update own status, admins can update any

### **4. Morning Checkin System**
- **Daily task submission**: Project + task description
- **Team task overview** grouped by member
- **Project selection** from existing projects or add new
- **Task management**: Add/remove tasks with proper permissions
- **Real-time updates** with timestamp display

### **5. Active Time & Memo Tracking**
- **Work session tracking** with start/stop functionality
- **Memo/description input** for work sessions with project selection
- **Session history** showing detailed work logs with time ranges
- **Duration calculations** with automatic time formatting
- **Live session updates** every few seconds
- **Project-based work categorization**

### **6. User Management (Admin Only)**
- **Create users**: Members and viewers with auto-generated passwords
- **Delete users** with confirmation dialogs
- **Role management** and user listing
- **Email validation** and duplicate prevention

### **7. Project Management (Admin Only)**
- **Create projects** with validation
- **Delete projects** (removes all associated logs)
- **Project listing** with usage statistics
- **Project integration** across all features

## **Database Schema (Supabase Tables)**

### **users**
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- role (text: admin/member/viewer, default: member)
- password_hash (text)
- created_at, updated_at (timestamptz)
```

### **log_entries**
```sql
- id (uuid, primary key)
- activity (text)
- project (text)
- workers (text)
- duration (text, HH:MM:SS format)
- duration_seconds (integer)
- upwork_hours (numeric)
- description (text)
- date (date)
- created_at, updated_at (timestamptz)
```

### **user_status**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- status (text: active/available-for-work/not-available)
- memo (text, nullable)
- timestamp (timestamptz)
- created_at (timestamptz)
```

### **active_time_sessions**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- date (date)
- start_time (timestamptz)
- end_time (timestamptz, nullable)
- duration_seconds (integer)
- memo (text, nullable)
- created_at (timestamptz)
```

### **morning_checkins**
```sql
- id (uuid, primary key)
- member_name (text)
- project (text)
- task (text)
- timestamp (timestamptz)
- created_at (timestamptz)
```

## **UI/UX Design Requirements**

### **Design Aesthetic**
- **Modern, clean interface** with "Apple-level" design quality
- **Consistent color scheme**: Blue primary, with green (success), red (danger), purple (secondary)
- **Rounded corners**: Use `rounded-xl` and `rounded-2xl` throughout
- **Proper spacing**: 8px spacing system with consistent padding/margins
- **Typography**: Clear hierarchy with proper font weights and sizes

### **Layout Structure**
- **Header**: Logo, user profile, logout functionality
- **Navigation tabs**: Activity Logs, Team Status, Active Time, Morning Checkin
- **Responsive design**: Mobile-first approach with proper breakpoints
- **Loading states**: Proper loading indicators for all async operations
- **Error handling**: User-friendly error messages with proper styling

### **Component Details**
- **Cards**: White background with subtle shadows and borders
- **Buttons**: Proper hover states and transitions
- **Forms**: Well-structured with proper validation and error display
- **Tables**: Responsive with card view for mobile
- **Modals**: Centered overlays with backdrop blur
- **Status indicators**: Color-coded with animated pulse for active states

## **Key Functionality Details**

### **Real-time Updates**
- **Status tracking**: Auto-refresh every 1-2 seconds
- **Active time tracking**: Live duration updates
- **Session management**: Automatic start/stop based on status changes

### **Permissions & Security**
- **Role-based access**: Strict permission checking throughout
- **RLS policies**: Proper Supabase row-level security
- **Data validation**: Client-side and server-side validation
- **Secure authentication**: Password hashing and session management

### **Data Management**
- **Filtering**: Advanced filtering with multiple criteria
- **Sorting**: Proper data sorting and organization
- **Export/Import**: CSV functionality with template downloads
- **Bulk operations**: Multi-select with confirmation dialogs

### **Time & Timezone**
- **Timezone support**: User-selectable timezones
- **Duration formatting**: Human-readable time formats
- **Date handling**: Proper date parsing and display
- **Session tracking**: Accurate time calculations

## **Navigation Structure**
1. **Activity Logs** (Default view)
2. **Team Status** (Real-time status tracking)
3. **Active Time** (Admin only - detailed work sessions)
4. **Morning Checkin** (Daily task management)

## **Additional Requirements**
- **Responsive design**: Works perfectly on mobile and desktop
- **Fast performance**: Optimized queries and efficient rendering
- **Proper error handling**: Graceful error states and user feedback
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Clean code**: Well-organized components and hooks
- **Type safety**: Full TypeScript coverage with proper types

## **Default Data**
- **Admin user**: Pre-configured admin account
- **Sample members**: 2-3 default member accounts
- **Sample viewer**: 1 default viewer account
- **Sample projects**: RHB, RHR, BAY projects
- **Initial activity logs**: Some sample log entries for testing

Create this application with all features fully functional, properly connected to Supabase, and with a polished, production-ready UI that demonstrates modern web development best practices.