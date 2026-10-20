# Real Estate CMS — Database Schema

## Overview

The application uses PostgreSQL hosted on Neon, accessed through Prisma ORM.

The database supports project management, dynamic website content, customer inquiries, administrative authentication, and audit logging.

## Database Models

### 1. Admin

Stores administrative user accounts.

| Field        | Purpose                    |
| ------------ | -------------------------- |
| id           | Primary key                |
| name         | Administrator name         |
| email        | Unique login email         |
| passwordHash | Hashed password            |
| role         | Administrator role         |
| createdAt    | Account creation timestamp |

### 2. Project

Stores real estate project information.

| Field       | Purpose                     |
| ----------- | --------------------------- |
| id          | Primary key                 |
| name        | Project name                |
| slug        | Unique URL identifier       |
| location    | Property location           |
| description | Project description         |
| heroImage   | Hero image URL              |
| status      | Draft or published          |
| seoTitle    | SEO page title              |
| seoDesc     | SEO description             |
| createdAt   | Creation timestamp          |
| updatedAt   | Last modification timestamp |

### 3. Section

Stores dynamic content sections.

| Field     | Purpose                |
| --------- | ---------------------- |
| id        | Primary key            |
| projectId | Foreign key to Project |
| title     | Section heading        |
| content   | Section description    |
| type      | Section identifier     |
| imageUrl  | Section image          |
| status    | Publication status     |
| order     | Display order          |

Example section types:

- connectivity
- developer

### 4. Amenity

Stores property amenities.

| Field     | Purpose                |
| --------- | ---------------------- |
| id        | Primary key            |
| projectId | Foreign key to Project |
| name      | Amenity name           |
| icon      | Icon identifier        |
| imageUrl  | Image URL              |
| status    | Publication status     |

### 5. Gallery

Stores property gallery images.

| Field     | Purpose                |
| --------- | ---------------------- |
| id        | Primary key            |
| projectId | Foreign key to Project |
| title     | Image title            |
| imageUrl  | Image URL              |
| category  | Gallery category       |
| status    | Publication status     |

### 6. FloorPlan

Stores property floor plan information.

| Field      | Purpose                |
| ---------- | ---------------------- |
| id         | Primary key            |
| projectId  | Foreign key to Project |
| name       | Floor plan name        |
| carpetArea | Carpet area            |
| totalArea  | Total area             |
| imageUrl   | Plan preview image     |
| pdfUrl     | PDF document URL       |
| status     | Publication status     |

### 7. Inquiry

Stores customer inquiries submitted through the website.

| Field     | Purpose                |
| --------- | ---------------------- |
| id        | Primary key            |
| projectId | Foreign key to Project |
| name      | Customer name          |
| email     | Customer email         |
| phone     | Customer phone         |
| message   | Inquiry message        |
| status    | Inquiry progress       |
| createdAt | Submission timestamp   |

Inquiry status values:

- new
- contacted
- closed

### 8. ActivityLog

Stores records of administrative actions.

| Field     | Purpose                      |
| --------- | ---------------------------- |
| id        | Primary key                  |
| adminId   | Administrator reference      |
| action    | Action performed             |
| entity    | Affected resource type       |
| entityId  | Affected resource ID         |
| details   | Additional audit information |
| createdAt | Action timestamp             |

## Entity Relationships

Project has a one-to-many relationship with:

- Section
- Amenity
- Gallery
- FloorPlan
- Inquiry

Admin is associated with administrative activity logs.

## Relationship Diagram

```text
                  ADMIN
                    |
                    | activity records
                    v
                ACTIVITY_LOG


                  PROJECT
                    |
       +------------+------------+
       |            |            |
       v            v            v
    SECTION       AMENITY      GALLERY
       |
       |     PROJECT
       |        |
       |    +---+---+
       |    |       |
       |    v       v
       | FLOOR_PLAN INQUIRY
       |
       +-- Each content record references a project
```

## Data Management

Prisma provides:

- Model definitions
- Database migrations
- Query execution
- Relationship handling
- Type-safe database access

## Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Apply committed migrations:

```bash
npx prisma migrate deploy
```

The authoritative schema is located at:

backend/prisma/schema.prisma

Refer to that file for exact field types, nullability, defaults, constraints, and delete behaviors.
