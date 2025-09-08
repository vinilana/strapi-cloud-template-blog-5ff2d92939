module.exports = () => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Courses CMS API',
        description: 'API documentation for the Courses Content Management System',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      'x-strapi-config': {
        mutateDocumentation: (generatedDocumentationDraft) => {
          // Add custom tags for better organization
          generatedDocumentationDraft.tags = [
            { name: 'Course', description: 'Course management endpoints' },
            { name: 'Module', description: 'Course module management endpoints' },
            { name: 'Lesson', description: 'Lesson management endpoints' },
            { name: 'Instructor', description: 'Instructor management endpoints' },
            { name: 'Course-category', description: 'Course category management endpoints' },
            { name: 'Tag', description: 'Tag management endpoints' },
            { name: 'Live-stream', description: 'Live stream management endpoints' }
          ];
        }
      },
      servers: [
        {
          url: 'http://localhost:1337/api',
          description: 'Development server'
        },
        {
          url: 'https://your-domain.com/api',
          description: 'Production server (replace with your domain)'
        }
      ]
    }
  }
});
