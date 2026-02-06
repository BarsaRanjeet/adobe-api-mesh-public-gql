const { injectImsAuth } = require("./minify.js");

const context = {
  secrets: {
    IMS_CLIENT_ID: "client-id-1234567890",
    IMS_CLIENT_SECRET: "client-secret-1234567890",
  },
};

injectImsAuth({ context, sourceName: 'example-source' })
  .then((authHeaders) => {
    console.log('Authorization Headers:', authHeaders);
  })
  .catch((error) => {
    console.error('Error injecting IMS auth:', error);
  });