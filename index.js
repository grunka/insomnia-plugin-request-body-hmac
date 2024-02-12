const crypto = require('crypto');
const {JSONPath} = require('jsonpath-plus');

const replacementContent = 'Will be replaced with HMAC of request body';

function hmac(content, options, queryString = null) {
  if (options.jsonPath) {
    content = JSON.stringify(JSONPath({
      path: options.jsonPath,
      json: JSON.parse(content),
      wrap: false
    }));
  }
  if (options.removeWhitespace) {
    content = JSON.stringify(JSON.parse(content));
  }
  if (options.queryParam) {
    content = queryString;
  }
  const hash = crypto.createHmac(options.algorithm, options.key);
  hash.update(content, 'utf8');
  return hash.digest(options.encoding);
}

function replaceWithHMAC(content, body, queryString) {
  return content.replace(new RegExp(replacementContent + ' \\(([a-f0-9]+)\\)', 'g'), (match, hex) => {
    const options = JSON.parse(Buffer.from(hex, 'hex').toString('utf-8'));
    return hmac(body, options, queryString)
  });
}

module.exports.templateTags = [{
  name: 'requestbodyhmac',
  displayName: 'Request body HMAC',
  description: 'HMAC a value or the request body',
  args: [
    {
      displayName: 'Algorithm',
      type: 'enum',
      options: [
        { displayName: 'MD5', value: 'md5' },
        { displayName: 'SHA1', value: 'sha1' },
        { displayName: 'SHA256', value: 'sha256' },
        { displayName: 'SHA512', value: 'sha512' }
      ]
    },
    {
      displayName: 'Digest Encoding',
      description: 'The encoding of the output',
      type: 'enum',
      options: [
        { displayName: 'Hexadecimal', value: 'hex' },
        { displayName: 'Base64', value: 'base64' }
      ]
    },
    {
      displayName: 'Remove whitespace from JSON',
      description: 'Parse and stringify JSON request body to remove any whitespace',
      type: 'enum',
      options: [
        { displayName: 'No', value: false },
        { displayName: 'Yes', value: true }
      ]
    },
    {
      displayName: 'JSONPath to object that should be hashed',
      description: 'If hashing is to be done only to a part of the request body select it using a JSONPath query. Note: whitespace will be removed before hashing',
      type: 'string',
      placeholder: 'JSONPath (leave empty to not use)'
    },
    {
      displayName: 'Key',
      type: 'string',
      placeholder: 'HMAC Secret Key'
    },
    {
      displayName: 'use Query Params as value',
      type: 'boolean',
    },
    {
      displayName: 'Message',
      type: 'string',
      placeholder: 'Message to hash (leave empty to use request body)'
    }
  ],
  async run(context, algorithm, encoding, removeWhitespace = false, jsonPath = '', key = '', queryParam, value = '') {
    if (encoding !== 'hex' && encoding !== 'base64') {
      throw new Error(`Invalid encoding ${encoding}. Choices are hex, base64`);
    }

    const valueType = typeof value;
    if (valueType !== 'string') {
      throw new Error(`Cannot hash value of type "${valueType}"`);
    }

    const options = {
      key: key,
      algorithm: algorithm,
      encoding: encoding,
      queryParam: queryParam === true || queryParam === 'true' ? true : undefined,
      jsonPath: jsonPath !== '' ? jsonPath : undefined,
      removeWhitespace: removeWhitespace === true || removeWhitespace === 'true' ? true : undefined
    };


    if (value === '') {
      return replacementContent + ' (' + Buffer.from(JSON.stringify(options)).toString('hex') + ')';
    } else {
      return hmac(value, options);
    }
  }
}];

module.exports.requestHooks = [
  async context => {
    const body = context.request.getBody();
    const queryParams = context.request.getParameters();
    const queryString = queryParams.map((x) => Object.values(x).join('=')).join('&')

    let bodyText = body.text || '';


    if (bodyText.indexOf(replacementContent) !== -1) {
      bodyText = replaceWithHMAC(bodyText, bodyText, queryString);
      context.request.setBody({
        ...body,
        text: bodyText,
      });
    }
    if (context.request.getUrl().indexOf(replacementContent) !== -1) {
      context.request.setUrl(replaceWithHMAC(context.request.getUrl(), bodyText, queryString));
    }
    context.request.getHeaders().forEach(h => {
      if (h.value.indexOf(replacementContent) !== -1) {
        context.request.setHeader(h.name, replaceWithHMAC(h.value, bodyText, queryString));
      }
    });
    context.request.getParameters().forEach(p => {
      if (p.value.indexOf(replacementContent) !== -1) {
        context.request.setParameter(p.name, replaceWithHMAC(p.value, bodyText, queryString));
      }
    });
  }

];
