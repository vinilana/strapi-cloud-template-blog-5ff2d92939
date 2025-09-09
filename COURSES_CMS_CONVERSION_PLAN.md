# Courses CMS Conversion Plan (Simplified)

## Overview
Convert the Strapi blog template into a simple Courses CMS for managing and displaying educational content without user tracking or assessment features.

## Core Content Types

### 1. Course (`api/course`)
Main content type for courses.

**Attributes:**
- `title` - string (required)
- `description` - rich text
- `shortDescription` - text (max 200 chars)
- `slug` - uid from title
- `thumbnail` - media (single image)
- `coverImage` - media (single image) 
- `introVideoUrl` - string (YouTube/Vimeo URL)
- `duration` - integer (total hours)
- `level` - enumeration (beginner, intermediate, advanced)
- `language` - string (default: English)
- `status` - enumeration (draft, published)
- `featured` - boolean
- `instructor` - relation (manyToOne with instructor)
- `category` - relation (manyToOne with course-category)
- `modules` - relation (oneToMany with module)
- `tags` - relation (manyToMany with tag)

### 2. Module (`api/module`)
Course sections/chapters.

**Attributes:**
- `title` - string (required)
- `description` - text
- `order` - integer
- `course` - relation (manyToOne with course)
- `lessons` - relation (oneToMany with lesson)

### 3. Lesson (`api/lesson`)
Individual lessons within modules.

**Attributes:**
- `title` - string (required)
- `description` - text
- `slug` - uid from title
- `order` - integer
- `module` - relation (manyToOne with module)
- `videoUrl` - string (YouTube/Vimeo URL)
- `content` - rich text
- `duration` - integer (minutes)
- `resources` - media (multiple files)

### 4. Instructor (`api/instructor`)
Replace current Author content type.

**Attributes:**
- `name` - string (required)
- `email` - email (unique)
- `bio` - rich text
- `avatar` - media (single image)
- `title` - string (e.g., "Senior Developer")
- `courses` - relation (oneToMany with course)

### 5. Course Category (`api/course-category`)
Replace current Category content type.

**Attributes:**
- `name` - string (required)
- `slug` - uid from name
- `description` - text
- `courses` - relation (oneToMany with course)

### 6. Tag (`api/tag`)
For additional categorization.

**Attributes:**
- `name` - string (required)
- `slug` - uid from name
- `courses` - relation (manyToMany with course)

### 7. Live Stream (`api/live-stream`)
For live streaming events and webinars.

**Attributes:**
- `title` - string (required)
- `description` - rich text
- `slug` - uid from title
- `thumbnail` - media (single image)
- `streamUrl` - string (streaming platform URL)
- `streamKey` - string (for RTMP streams)
- `platform` - enumeration (youtube, twitch, zoom, custom)
- `scheduledAt` - datetime
- `duration` - integer (estimated minutes)
- `streamStatus` - enumeration (upcoming, live, ended)
- `instructor` - relation (manyToOne with instructor)
- `course` - relation (manyToOne with course, optional)
- `recordingUrl` - string (post-stream recording)
- `maxAttendees` - integer (optional)
- `isPublic` - boolean (default: true)

## Implementation Steps

### Week 1: Setup Core Structure
1. **Day 1-2**: Create Course content type
   - Generate API: `npm run strapi generate content-type`
   - Add all fields and relations
   - Test CRUD operations

2. **Day 3-4**: Create Module and Lesson content types
   - Set up proper relations
   - Add ordering fields
   - Test nested data retrieval

3. **Day 5**: Create Instructor (convert from Author)
   - Migrate existing author data
   - Update relations

### Week 2: Complete Setup & Migration
1. **Day 1**: Create Live Stream content type
   - Add scheduling fields
   - Set up platform integrations
   
2. **Day 2-3**: Create Category and Tag content types
   - Migrate existing categories
   - Set up many-to-many relations

3. **Day 4**: Update seed script
   - Create `data/courses-data.json`
   - Modify `scripts/seed.js`
   - Add sample course content
   - Add sample live streams

4. **Day 5**: Testing and refinement
   - Test all API endpoints
   - Verify data relationships
   - Performance testing

## File Structure Changes

```
src/api/
├── course/
│   ├── content-types/course/schema.json
│   ├── controllers/course.js
│   ├── services/course.js
│   └── routes/course.js
├── module/
│   ├── content-types/module/schema.json
│   ├── controllers/module.js
│   ├── services/module.js
│   └── routes/module.js
├── lesson/
│   ├── content-types/lesson/schema.json
│   ├── controllers/lesson.js
│   ├── services/lesson.js
│   └── routes/lesson.js
├── instructor/  (renamed from author)
│   ├── content-types/instructor/schema.json
│   ├── controllers/instructor.js
│   ├── services/instructor.js
│   └── routes/instructor.js
├── course-category/  (renamed from category)
│   ├── content-types/course-category/schema.json
│   ├── controllers/course-category.js
│   ├── services/course-category.js
│   └── routes/course-category.js
├── tag/
│   ├── content-types/tag/schema.json
│   ├── controllers/tag.js
│   ├── services/tag.js
│   └── routes/tag.js
└── live-stream/
    ├── content-types/live-stream/schema.json
    ├── controllers/live-stream.js
    ├── services/live-stream.js
    └── routes/live-stream.js
```

## Migration Commands

```bash
# 1. Backup existing data
npm run strapi export -- -f backup-blog.tar.gz

# 2. Create new content types (use Strapi CLI)
npm run strapi generate

# 3. Build admin panel
npm run build

# 4. Run development server
npm run develop

# 5. Run seed script for sample data
npm run seed:courses
```

## API Endpoints (Automatic)

Strapi will automatically generate these endpoints:

```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id

GET    /api/modules
GET    /api/modules/:id

GET    /api/lessons
GET    /api/lessons/:id

GET    /api/instructors
GET    /api/instructors/:id

GET    /api/course-categories
GET    /api/course-categories/:id

GET    /api/tags
GET    /api/tags/:id

GET    /api/live-streams
GET    /api/live-streams/:id
POST   /api/live-streams
PUT    /api/live-streams/:id
DELETE /api/live-streams/:id
```

## Custom API Features (Optional)

### Course Controller
Add to `src/api/course/controllers/course.js`:

```javascript
module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  // Get course with all modules and lessons
  async findOneComplete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.service('api::course.course').findOne(id, {
      populate: {
        modules: {
          populate: {
            lessons: true
          }
        },
        instructor: true,
        category: true
      }
    });
    return this.transformResponse(entity);
  }
}));
```

### Live Stream Controller
Add to `src/api/live-stream/controllers/live-stream.js`:

```javascript
module.exports = createCoreController('api::live-stream.live-stream', ({ strapi }) => ({
  // Get upcoming streams
  async findUpcoming(ctx) {
    const now = new Date();
    const entities = await strapi.service('api::live-stream.live-stream').find({
      filters: {
        scheduledAt: { $gte: now },
        status: 'upcoming'
      },
      sort: 'scheduledAt:asc',
      populate: ['instructor', 'course', 'thumbnail']
    });
    return this.transformResponse(entities);
  },
  
  // Get live streams
  async findLive(ctx) {
    const entities = await strapi.service('api::live-stream.live-stream').find({
      filters: { status: 'live' },
      populate: ['instructor', 'course', 'thumbnail']
    });
    return this.transformResponse(entities);
  }
}));
```

## Sample Seed Data Structure

Create `data/courses-data.json`:

```json
{
  "instructors": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "Experienced web developer",
      "title": "Senior Developer"
    }
  ],
  "categories": [
    {
      "name": "Web Development",
      "slug": "web-development",
      "description": "Learn web development"
    }
  ],
  "courses": [
    {
      "title": "Introduction to JavaScript",
      "description": "Learn JavaScript basics",
      "shortDescription": "JavaScript for beginners",
      "duration": 10,
      "level": "beginner",
      "status": "published",
      "featured": true
    }
  ],
  "modules": [
    {
      "title": "Getting Started",
      "description": "Introduction to JavaScript",
      "order": 1
    }
  ],
  "lessons": [
    {
      "title": "What is JavaScript?",
      "description": "Introduction to the language",
      "videoUrl": "https://youtube.com/watch?v=xxx",
      "content": "JavaScript is a programming language...",
      "duration": 15,
      "order": 1
    }
  ],
  "liveStreams": [
    {
      "title": "JavaScript Q&A Session",
      "description": "Live Q&A about JavaScript fundamentals",
      "platform": "youtube",
      "streamUrl": "https://youtube.com/live/xxx",
      "scheduledAt": "2024-01-15T18:00:00Z",
      "duration": 60,
      "status": "upcoming",
      "isPublic": true
    }
  ]
}
```

## Update Permissions

In `scripts/seed.js`, update permissions:

```javascript
await setPublicPermissions({
  course: ['find', 'findOne'],
  module: ['find', 'findOne'],
  lesson: ['find', 'findOne'],
  instructor: ['find', 'findOne'],
  'course-category': ['find', 'findOne'],
  tag: ['find', 'findOne'],
  'live-stream': ['find', 'findOne']
});
```

## Environment Variables

No changes needed to `.env.example` - existing configuration works.

## Quick Start After Implementation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start Strapi
npm run develop

# In another terminal, seed data
npm run seed:courses

# Access admin panel
# http://localhost:1337/admin

# Access API
# http://localhost:1337/api/courses
```

## Notes

- All content is publicly readable (no authentication required)
- Use Strapi's built-in admin panel for content management
- Media files stored locally by default (configure S3 for production)
- Consider adding Cloudinary for video management in production