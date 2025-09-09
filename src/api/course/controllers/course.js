'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;

    const mergePopulate = (existing, required) => {
      if (!existing) {
        return required.reduce((acc, key) => { acc[key] = true; return acc; }, {});
      }
      if (typeof existing === 'string') {
        return existing; // e.g., 'deep' → já cobre
      }
      if (Array.isArray(existing)) {
        const set = new Set(existing);
        required.forEach((key) => set.add(key));
        return Array.from(set);
      }
      if (typeof existing === 'object') {
        const extra = required.reduce((acc, key) => { acc[key] = true; return acc; }, {});
        return { ...existing, ...extra };
      }
      return existing;
    };

    const populate = mergePopulate(query?.populate, ['thumbnail']);
    const entities = await strapi.service('api::course.course').find({ ...query, populate });
    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const mergePopulate = (existing, required) => {
      if (!existing) {
        return required.reduce((acc, key) => { acc[key] = true; return acc; }, {});
      }
      if (typeof existing === 'string') {
        return existing;
      }
      if (Array.isArray(existing)) {
        const set = new Set(existing);
        required.forEach((key) => set.add(key));
        return Array.from(set);
      }
      if (typeof existing === 'object') {
        const extra = required.reduce((acc, key) => { acc[key] = true; return acc; }, {});
        return { ...existing, ...extra };
      }
      return existing;
    };

    const populate = mergePopulate(query?.populate, ['thumbnail']);
    const entity = await strapi.service('api::course.course').findOne(id, { ...query, populate });
    if (!entity) {
      return ctx.notFound();
    }
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

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
        category: true,
        tags: true,
        thumbnail: true,
        coverImage: true
      }
    });
    
    if (!entity) {
      return ctx.notFound();
    }
    
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));