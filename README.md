# Insomnia template tag for HMAC signature of message or request body

Based on the [Template tag for hashing](https://github.com/getinsomnia/insomnia/tree/develop/plugins/insomnia-plugin-hash) and also the [HMAC template tag plugin](https://www.npmjs.com/package/insomnia-plugin-hmac) published to NPM.

For the nice rest client [Insomnia](https://insomnia.rest).

Install by going to the plugins tab in Insomnia and search for `insomia-plugin-request-body-hmac` or go to https://insomnia.rest/plugins/insomnia-plugin-request-body-hmac and click the Install Plugin button.

Main feature is being able to generate HMAC signatures using a key and a message and placing this into the request with the possibility of using the request body or parts of it as the message.

The signature can be inserted into any place where Insomnia accepts template tags like the url, request parameters, headers, and request body itself. Inserting it into the request body should only be used when selecting a different portion of the request body using a JSONPath since the result otherwise probably will not be what you expect due to the recursion.

Has an option of removing whitespace from a JSON request body before calculating the signature.

Allows you to create multiple different HMAC signatures with different options in the same request, previous versions only supported a single HMAC generated for each request.
