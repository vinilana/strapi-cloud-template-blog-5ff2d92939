'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::live-stream.live-stream', ({ strapi }) => ({
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