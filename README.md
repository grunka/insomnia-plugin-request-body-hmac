# Insomnia template tag for HMAC signature of message or request body

Based on the [Template tag for hashing](https://github.com/getinsomnia/insomnia/tree/develop/plugins/insomnia-plugin-hash) and also the [HMAC template tag plugin](https://www.npmjs.com/package/insomnia-plugin-hmac) published to NPM.

For the nice rest client [Insomnia](https://insomnia.rest)

Install by going to the plugins tab in Insomnia and search for `insomia-plugin-request-body-hmac`

Main feature is being able to generate HMAC signatures from a key and a message, where the message can be the request body content. 

The signature can be inserted into the url, request parameters, headers, and request body itself. That last one is probably only useful in combination of doing the signature using a portion of the request body selected by JSONPath. Also has an option of removing whitespace from a JSON request body before calculating the signature.

Now also allows you to create multiple different HMAC signatures with different options in the same request.
