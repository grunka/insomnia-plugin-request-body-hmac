# Insomnia template tag for HMAC signature of message or request body

Based on the [Template tag for hashing](https://github.com/getinsomnia/insomnia/tree/develop/plugins/insomnia-plugin-hash) and also the [HMAC template tag plugin](https://www.npmjs.com/package/insomnia-plugin-hmac) published to NPM.

For the nice rest client [Insomnia](https://insomnia.rest).

Install by going to the plugins tab in Insomnia and search for `insomia-plugin-request-body-hmac` or go to https://insomnia.rest/plugins/insomnia-plugin-request-body-hmac and click the Install Plugin button.

Main feature is being able to generate HMAC signatures using a key and a message and placing this into the request with the possibility of using the request body or parts of it as the message.

The signature can be inserted into any place where Insomnia accepts template tags like the url, request parameters, headers, and request body itself. Inserting it into the request body should only be used when selecting a different portion of the request body using a JSONPath since the result otherwise probably will not be what you expect due to the recursion.

Has an option of removing whitespace from a JSON request body before calculating the signature.

Allows you to create multiple different HMAC signatures with different options in the same request, previous versions only supported a single HMAC generated for each request.

## Examples

Add the tag by pushing `Ctrl + Space` and search for `Request body HMAC`, you will see several variants for the different hash functions used. You can change the hash function used later as well.

<img width="1238" alt="Window showing tag in body of request" src="https://user-images.githubusercontent.com/152836/211903314-5bac41fc-371f-4f61-8862-b7f01d08aef7.png">

Clicking the tag allows you to change the settings for the tag. It is for instance in here you will enter the key used. The Live Preview at the bottom contains a temporary value that will be replaced later unless you input a message in the field above it. The hex string in paranthesis, if you wonder why that is there, contains the settings that will be used to create the signature.

<img width="1041" alt="Settings screen for the tag" src="https://user-images.githubusercontent.com/152836/211903356-41242fdf-29c0-4809-b38a-e24c83a0f4b5.png">

[jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath#readme) is used to navigate the request content to select the message to use instead of the complete body if needed. Please look at the linked project for more details about the syntax, but basically you can use `$` to indicate the root object and then navigate down through objects separating each field by dots.

However, most uses will probably put these signatures in headers.

<img width="1238" alt="Multiple tags in headers" src="https://user-images.githubusercontent.com/152836/211904685-a115b051-3014-41b5-8ed2-b057af793279.png">

Any uses in the body will be generated first so this could be used to do multiple levels of signatures for those special APIs you might encounter. But multiple signatures wrapping eachother in the body will break unless you are very lucky.
