module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/live-streams/upcoming',
      handler: 'live-stream.findUpcoming',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/live-streams/live',
      handler: 'live-stream.findLive',
      config: {
        auth: false
      }
    }
  ]
};