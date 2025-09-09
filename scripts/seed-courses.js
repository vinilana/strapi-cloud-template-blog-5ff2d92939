'use strict';

const fs = require('fs-extra');
const path = require('path');
const { instructors, categories, tags, courses, modules, lessons, liveStreams } = require('../data/courses-data.json');

async function seedCoursesApp() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the courses template...');
      await importSeedData();
      console.log('Courses CMS ready to go!');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. Clear your database first to reimport.'
    );
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'coursesInitHasRun' });
  await pluginStore.set({ key: 'coursesInitHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function createEntry({ model, entry }) {
  try {
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function importInstructors() {
  const instructorMap = {};
  for (let i = 0; i < instructors.length; i++) {
    const instructor = instructors[i];
    const created = await strapi.documents('api::instructor.instructor').create({
      data: {
        ...instructor,
        publishedAt: Date.now(),
      },
    });
    instructorMap[i] = created.documentId;
  }
  return instructorMap;
}

async function importCategories() {
  const categoryMap = {};
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const created = await strapi.documents('api::course-category.course-category').create({
      data: {
        ...category,
        publishedAt: Date.now(),
      },
    });
    categoryMap[i] = created.documentId;
  }
  return categoryMap;
}

async function importTags() {
  const tagMap = {};
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const created = await strapi.documents('api::tag.tag').create({
      data: {
        ...tag,
        publishedAt: Date.now(),
      },
    });
    tagMap[i] = created.documentId;
  }
  return tagMap;
}

async function importCourses(instructorMap, categoryMap, tagMap) {
  const courseMap = {};
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const courseTags = course.tags ? course.tags.map(tagIndex => tagMap[tagIndex]) : [];
    
    const created = await strapi.documents('api::course.course').create({
      data: {
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        duration: course.duration,
        level: course.level,
        language: course.language,
        status: course.status,
        featured: course.featured,
        introVideoUrl: course.introVideoUrl,
        instructor: instructorMap[course.instructor],
        category: categoryMap[course.category],
        tags: courseTags,
      },
      status: 'published',
    });
    courseMap[i] = created.documentId;
  }
  return courseMap;
}

async function importModules(courseMap) {
  const moduleMap = {};
  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    const created = await strapi.documents('api::module.module').create({
      data: {
        ...module,
        course: courseMap[module.course],
        publishedAt: Date.now(),
      },
    });
    moduleMap[i] = created.documentId;
  }
  return moduleMap;
}

async function importLessons(moduleMap) {
  for (const lesson of lessons) {
    await strapi.documents('api::lesson.lesson').create({
      data: {
        ...lesson,
        module: moduleMap[lesson.module],
      },
      status: 'published',
    });
  }
}

async function importLiveStreams(instructorMap, courseMap) {
  for (const stream of liveStreams) {
    await strapi.documents('api::live-stream.live-stream').create({
      data: {
        title: stream.title,
        description: stream.description,
        platform: stream.platform,
        streamUrl: stream.streamUrl,
        scheduledAt: stream.scheduledAt,
        duration: stream.duration,
        streamStatus: stream.streamStatus,
        isPublic: stream.isPublic,
        maxAttendees: stream.maxAttendees,
        instructor: instructorMap[stream.instructor],
        course: stream.course !== undefined ? courseMap[stream.course] : null,
      },
      status: 'published',
    });
  }
}

async function importSeedData() {
  // Set public permissions
  await setPublicPermissions({
    course: ['find', 'findOne'],
    module: ['find', 'findOne'],
    lesson: ['find', 'findOne'],
    instructor: ['find', 'findOne'],
    'course-category': ['find', 'findOne'],
    tag: ['find', 'findOne'],
    'live-stream': ['find', 'findOne']
  });

  // Import data in order (respecting relationships)
  console.log('Importing instructors...');
  const instructorMap = await importInstructors();
  
  console.log('Importing categories...');
  const categoryMap = await importCategories();
  
  console.log('Importing tags...');
  const tagMap = await importTags();
  
  console.log('Importing courses...');
  const courseMap = await importCourses(instructorMap, categoryMap, tagMap);
  
  console.log('Importing modules...');
  const moduleMap = await importModules(courseMap);
  
  console.log('Importing lessons...');
  await importLessons(moduleMap);
  
  console.log('Importing live streams...');
  await importLiveStreams(instructorMap, courseMap);
  
  console.log('All course data imported successfully!');
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedCoursesApp();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});