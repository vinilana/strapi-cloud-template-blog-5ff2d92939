'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::live-stream.live-stream', ({ strapi }) => ({
  async find(ctx) {
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
    const entities = await strapi.service('api::live-stream.live-stream').find({ ...query, populate });
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
    const entity = await strapi.service('api::live-stream.live-stream').findOne(id, { ...query, populate });
    if (!entity) {
      return ctx.notFound();
    }
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async findUpcoming(ctx) {
    const now = new Date();
    const entities = await strapi.service('api::live-stream.live-stream').find({
      filters: {
        scheduledAt: { $gte: now },
        streamStatus: 'upcoming'
      },
      sort: 'scheduledAt:asc',
      populate: ['instructor', 'course', 'thumbnail']
    });
    
    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },
  
  async findLive(ctx) {
    const entities = await strapi.service('api::live-stream.live-stream').find({
      filters: { streamStatus: 'live' },
      populate: ['instructor', 'course', 'thumbnail']
    });
    
    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  }
}));