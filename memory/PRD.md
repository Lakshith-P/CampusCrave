# CampusCrave - Product Requirements Document

## Original Problem Statement
Campus food delivery platform with multi-role dashboards, food/store browsing, smart cart, voice commands, live tracking, payment module, offers, referrals, and analytics.

## Architecture
- Frontend: React 19 + Tailwind + Shadcn UI + Framer Motion + Recharts
- Backend: FastAPI + MongoDB + WebSocket
- Storage: Emergent Object Storage
- Voice: Web Speech API
- Real-time: WebSocket
- Payment: Mock payment with 4 methods (UPI, Card, Wallet, Credits)

## What's Been Implemented (April 2026)

### Phase 1 (MVP)
- Multi-role auth (student/outlet_staff/admin)
- 11 venues (8 food courts + 3 provision stores), 18 menu items
- Food browsing with venue cards, menu modals
- Smart cart with quantity controls
- Checkout with location picker + confetti animation
- Order tracking with SVG campus map
- Voice command (Web Speech API)
- Outlet Kanban board
- Admin analytics dashboard

### Phase 2 (Feature Expansion - Current)
- Payment module: UPI, Card, Wallet, Credits options
- Video slider in item detail modal (YouTube embeds)
- Today's Offers with countdown timers (4 active offers)
- Specials For You personalized recommendations
- Trending Now section with order counts
- Combo deals with savings badges
- Referral system (share code, earn 50 credits per referral, 25 for invitee)
- Loyalty points (1 point per ₹10 spent)
- Outlet dashboard: earnings stats, reviews feed, commission breakdown, top items
- Admin dashboard: platform profit, user growth, referral stats, revenue pie chart

## Prioritized Backlog
### P1
- Real payment gateway integration (Razorpay)
- Password hashing (bcrypt)
- Admin CRUD for venues/menus/users
- Delivery agent management

### P2
- Push notifications
- Order reorder (quick reorder past orders)
- Peak hours heatmap
- Agent performance metrics
- Loyalty points redemption

## Test Credentials
- Student: student@lpu.in / student123
- Outlet Staff: dominos@campuscrave.com / staff123
- Admin: admin@campuscrave.com / admin123
