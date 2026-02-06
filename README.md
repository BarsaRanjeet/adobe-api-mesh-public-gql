# adobe-api-mesh-public-gql
Let’s create a real-time use case where you want to make graphql query public from a private GraphQL query.


# To create api mesh in adobe appbuilder
> create a secrets.yaml file and replace with values that have in secrets.example.yaml file
> in swagger.json file update "url": "https://na1-sandbox.api.commerce.adobe.com/<instance-id>" instance url with ACCS base url
> to create or update api mesh in appbuilder run following command
- aio api-mesh create mesh.json --secrets secrets.yaml
- aio api-mesh update mesh.json --secrets secrets.yaml

> to view status
- aio api-mesh status