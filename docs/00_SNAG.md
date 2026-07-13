# SNAG - Platform Documentation for AI Agents

> **One-liner:** At SNAG, we build the future of rent.

---

## What is SNAG?

SNAG is a trusted sublet marketplace that connects **sublettors** (people renting out their space) with **sublettees** (people looking for short-term housing) through trusted friend circles. The platform fills the gap between Airbnb (short stays) and Zillow (long-term leases) by focusing on the growing sublet economy.

### The Problem We Solve

- **GenZ moves frequently** – internships, relationships, new opportunities mean people relocate every few months
- **Traditional 12-month leases don't fit modern lifestyles** – the long-term lease model is dying
- **The sublet market is fragmented and untrusted** – currently operating through Instagram stories, Facebook groups, and alumni chats
- **Finding sublets takes months** – posts don't reach big enough networks, and people don't trust strangers
- **Rent is the biggest expense** – over half of US renters spend more than 30% of income on rent

### Our Solution

SNAG makes subletting **fast and trusted** by:

- Matching friends-of-friends instantly through contact syncs
- Providing a proper home for the GenZ sublet subculture
- Facilitating secure booking and payment flows
- Using AI agents to guide conversations toward successful bookings

---

## The SNAG Manifesto

> From long form videos, we moved to bite size content.  
> From long term leases, we are moving to sublets.  
> Urban culture is transforming.  
> GenZ needs flexibility around changing work and life events.  
> The 12-month-lease model will be dead.  
> **SNAG will house the moving generation.**

---

## Company Background

**Company:** Snag Sublets, Co.

SNAG evolved from **OneRoof**, a social network used by 200K+ young neighbors to build community in their apartment buildings. Through OneRoof, we discovered an underground economy of sublets and lease takeovers. After extensive user research (55+ in-depth interviews), we pivoted to focus exclusively on solving the sublet problem.

### Why We Pivoted from OneRoof

- OneRoof's "hyper-local" model faced scaling challenges
- Local boundary limits virality when users don't know neighbors to invite
- Limited people per group = limited content and advertiser visibility
- Users primarily used OneRoof for: selling home goods (45%), finding sublets (12%), and services (7%)
- We chose to laser-focus on sublets and solve it perfectly for one audience

---

## Team Values

We are:

- 🌟 **Believers** who think 'everything is possible' by default
- 🌟 **Competitive** and obsessed to create the best product fastest
- 🌟 **Curious** consumer technology lovers
- 🌟 **Hard workers** who set the bar high and rise to the challenge
- 🌟 **Builders** with fire in their gut, who have a reason to build
- 🌟 **Individuals** who care to have a voice and ownership
- 🌟 **Community-driven**, surrounding ourselves with people we learn from and grow with

---

## Core Platform Concepts

### Users

Users on SNAG can act as:

- **Sublettors** – People offering their space for rent (posting a sublet)
- **Sublettees** – People looking to rent a space (searching for sublets)

User attributes include: profile information, university affiliation, company, verification status, Stripe connect accounts for payments, and social connections.

### Posts

Posts represent sublet listings with two types:

- **Offering** – A sublettor has a space available
- **Looking For** – A sublettee is searching for a space

Post details include: description, unit type (studio, 1BR, 2BR, etc.), price, availability dates, location/address, and media (photos).

Offering posts can opt into **instant book**. An instant-book post can be booked directly by an authenticated sublettee without first sending a freemium-limited booking request message. Successful instant bookings immediately enter the paid booking flow and close the post so it no longer appears as available.

### Connections

SNAG builds trust through social graphs:

- Users can sync contacts to find friends-of-friends
- Connections are notified when their network posts sublets
- Trust flows through mutual connections

### Chat Rooms

When users are interested in a sublet, they enter a chat room to communicate. Chat rooms facilitate:

- Direct messaging between sublettor and sublettee
- Video call scheduling
- Agreement negotiation
- Booking completion

### Agreements (Bookings)

Agreements are the formal booking contracts between parties, containing:

- Move-in and move-out dates
- Monthly and total pricing
- Security deposits
- Cancellation policies
- Payment periods
- Legal names and unit details

Agreement statuses: `pending`, `approved`, `paid`, `signed`, `completed`, `cancelled`, `declined`

Instant-book agreements are created from an eligible offering post and the authenticated requester. The post owner, requester, price, fees, and final paid transition are controlled server-side; the requester provides booking details such as dates and payment period. When payment succeeds, SNAG marks the agreement as paid and uses the existing paid-booking flow to close the post.

After an instant-book payment succeeds, SNAG starts a 24-hour sublettor confirmation communication flow: both parties receive confirmations, the agent asks the sublettor to confirm in chat, the sublettor receives a 12-hour SMS reminder if they have not replied, and the team receives a 24-hour Slack escalation if the sublettor still has not replied.

### Timeslots (Video Calls)

Before booking, SNAG encourages users to have a video call to build trust. Timeslots track:

- Proposed call times
- Confirmation status
- Pre-call reminders
- Post-call follow-ups

---

## AI Chat Agents

SNAG uses AI agents to guide conversations toward successful bookings. The agent appears as a single identity but uses specialized services:

### 1. Scheduling Agent

- Helps users schedule their first video call
- Creates, confirms, updates, or deletes timeslots
- Only activates when there's no confirmed call yet

### 2. Rescheduling Agent

- Handles changes to already-confirmed video calls
- Requires both parties to agree before rescheduling

### 3. Pre-Call Reminder Agent

- Sends reminder 1 hour before confirmed calls
- One-way notification, doesn't respond to replies

### 4. Post-Call Agent

- Sends follow-up after completed video calls
- Skips follow-up when the chat room already has a paid agreement
- Encourages users to proceed with booking

**Key AI Behavior:**

- Never uses technical jargon (no "timeslot", "pending", "slot")
- Only responds to relevant messages (ignores off-topic discussions)
- Respects cooldown periods to avoid spam
- Can be disabled per chat room

---

## Communication Channels

SNAG keeps users informed through multiple channels:

### Push Notifications (Real-time)

- New chat messages
- Agreement status changes
- New connections
- Video call invitations

### Email Notifications

- Booking requests and confirmations
- Unread message reminders
- Post expiration warnings
- Matching sublet suggestions

### SMS Notifications

- Unread message reminders
- Payment transfer issues
- Deposit refunds
- Urgent account issues

---

## Technical Architecture

### Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Cache:** Redis
- **Authentication:** Firebase Auth
- **File Storage:** AWS S3
- **Payments:** Stripe (Connect for sublettors, regular for sublettees)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Video Calls:** Custom VoIP integration
- **SMS:** Twilio
- **Logging:** Pino
- **Rate Limiting:** NestJS Throttler

### Key Modules

| Domain                  | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `users`                 | User profiles, verification, account management |
| `posts`                 | Sublet listings (offering and looking-for)      |
| `chat-rooms`            | Messaging between users                         |
| `chat-messages`         | Individual messages in chat rooms               |
| `chat-timeslots`        | Video call scheduling                           |
| `agreements`            | Booking contracts and payments                  |
| `user-connections`      | Social graph and friend relationships           |
| `media`                 | Photo and file uploads                          |
| `devices`               | Push notification registration                  |
| `verification-sessions` | ID verification                                 |
| `payment-intents`       | Stripe payment processing                       |

### Apps Structure

| App         | Purpose                                   |
| ----------- | ----------------------------------------- |
| `api`       | Mobile app API endpoints                  |
| `admin`     | Admin panel API endpoints                 |
| `webhooks`  | External service callbacks (Stripe, etc.) |
| `redirects` | Deep linking and URL redirects            |

---

## Market Size

- **US Apartment Rental Industry:** $282.3B (by revenue)
- **Renting Households:** 44 million (~35% of US households)
- **Rent-Burdened Renters:** 22.4 million spend >30% of income on rent
- **Annual Movers:** ~27 million Americans
- **Apartment Turnover Rate:** 47-48% nationally

The subletting market is challenging to quantify due to its significant informal economy – which is exactly the opportunity SNAG is capturing.

---

## Distribution Strategy

1. **Auto-generated Instagram stories** with deep links from the SNAG app
2. **Ambassador Club** for distribution in alumni, international student, and company groups
3. **Accelerator partnerships** (Antler, YC)
4. **OneRoof user base** (150K+ NYC residents)
5. **Summer internship partnerships** with hiring companies

---

## Key URLs

- **Website:** <https://snagsublets.com>
- **Instagram:** @snagsubletsnyc

---

## For AI Agents: Important Context

When working with SNAG codebase:

1. **User Types:** Always distinguish between sublettors (offering) and sublettees (looking)
2. **Trust is Core:** The platform's value prop is trust through social connections
3. **Video Calls Matter:** The booking flow encourages video calls before finalizing
4. **Agent Identity:** AI agents use a single user ID but different specialized services
5. **Time Zone:** All times are handled in Eastern Time (ET)
6. **Terminology:** Avoid "timeslot", "pending", "slot" – use human-friendly language
7. **Cool-downs:** Agents respect cooldown periods to avoid overwhelming users
8. **Confirmation Rules:** A timeslot creator cannot confirm their own timeslot
