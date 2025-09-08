'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
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