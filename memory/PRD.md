# CampusCrave - Product Requirements Document

## Original Problem Statement
Campus food delivery and provision store management platform with multi-role dashboards (Student, Outlet Staff, Admin), food/store browsing, smart cart with credits, voice commands, live order tracking, Kanban order management, external pickup service, ratings/reviews, and admin analytics.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor) + WebSocket
- **Storage**: Emergent Object Storage (for file uploads)
- **Voice**: Web Speech API (browser-native)
- **Real-time**: WebSocket for order updates

## User Personas
1. **Students**: Browse food courts/stores, order food, track deliveries, request external pickups
2. **Outlet Staff**: Manage incoming orders via Kanban board, update order status
3. **Admin**: Platform control, analytics, venue/user management

## Core Requirements
- Multi-role auth with role-based dashboard routing
- 8+ food courts + 3 provision stores with rich media
- Smart cart with credits, location picker, confetti on checkout
- Voice command navigation (Web Speech API)
- Live order tracking with SVG campus map
- Kanban order board for outlets
- External pickup service (Blinkit, Amazon, etc.)
- Ratings & reviews
- Admin analytics dashboard

## What's Been Implemented (April 2026)
- [x] Multi-role authentication (student, outlet_staff, admin)
- [x] Student dashboard with neo-brutal design
- [x] 11 venues (8 food courts + 3 provision stores) with 20 menu items
- [x] Food/store browsing with venue cards and menu modals
- [x] Item detail modal with ingredients, health score, nutritional info, allergens
- [x] Smart cart with quantity controls, special instructions
- [x] Checkout with location picker and confetti animation
- [x] Order tracking with SVG campus map and timeline
- [x] Voice command button with Web Speech API
- [x] Outlet Kanban board (Incoming, Preparing, Ready, Picked Up)
- [x] Admin analytics dashboard with charts
- [x] External pickup service form
- [x] WebSocket for real-time order updates
- [x] Ratings & reviews system
- [x] Object storage integration for file uploads

## Prioritized Backlog
### P0 (Critical)
- None remaining for MVP

### P1 (Important)
- Admin venue/menu CRUD management forms
- Admin user management with role assignment
- Delivery agent management and assignment
- Real drag-and-drop on Kanban board

### P2 (Nice to Have)
- Push-style in-app notifications
- Peak hours heatmap in admin analytics
- Top-selling items analytics
- Credit usage tracking
- Agent performance metrics
- Voice command for adding items directly ("Add 2 Margherita from Dominos")

## Next Tasks
1. Admin CRUD for venues and menu items
2. User management panel
3. Enhanced analytics (heatmap, top items)
4. Password hashing for production
5. Image upload for menu items via object storage
