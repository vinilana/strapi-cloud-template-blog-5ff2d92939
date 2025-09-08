module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/courses/:id/complete',
      handler: 'course.findOneComplete',
      config: {
        auth: false
      }
    }
  ]
};