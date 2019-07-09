const crypto = require('crypto');
const JSONPath = require('jsonpath-plus');

const replacementContent = 'Will be replaced with HMAC of request body';
const settings = {
  key: null,
  algorithm: null,
  encoding: null,
  jsonPath: null,
  removeWhitespace: false
};

function hmac(content) {
  if (settings.jsonPath) {
    content = JSON.stringify(JSONPath({path: settings.jsonPath, json: JSON.parse(content)}))
  }
  if (settings.removeWhitespace) {
    content = JSON.stringify(JSON.parse(content));
  }
  const hash = crypto.createHmac(settings.algorithm, settings.key);
  hash.update(content, 'utf8');
  return hash.digest(settings.encoding);
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
      displayName: 'Message',
      type: 'string',
      placeholder: 'Message to hash (leave empty to use request body)'
    }
  ],
  run(context, algorithm, encoding, removeWhitespace = false, jsonPath = '', key = '', value = '') {
    if (encoding !== 'hex' && encoding !== 'base64') {
      throw new Error(`Invalid encoding ${encoding}. Choices are hex, base64`);
    }

    const valueType = typeof value;
    if (valueType !== 'string') {
      throw new Error(`Cannot hash value of type "${valueType}"`);
    }
    
    settings.key = key;
    settings.algorithm = algorithm;
    settings.encoding = encoding;
    settings.removeWhitespace = removeWhitespace;
    settings.jsonPath = jsonPath;
    
    if (value === '') {
      return replacementContent;
    } else {
      return hmac(value);
    }
  }
}];

module.exports.requestHooks = [
  context => {
    context.request.getHeaders().forEach(h => {
      if (h.value.indexOf(replacementContent) !== -1) {
        context.request.setHeader(h.name, h.value.replace(replacementContent, hmac(context.request.getBodyText())));
      }
    });
    if (context.request.getUrl().indexOf(replacementContent) !== -1) {
      context.request.setUrl(context.request.getUrl().replace(replacementContent, hmac(context.request.getBodyText())));
    }
    context.request.getParameters().forEach(p => {
      if (p.value.indexOf(replacementContent) !== -1) {
        context.request.setParameter(p.name, p.value.replace(replacementContent, hmac(context.request.getBodyText())));
      }
    });
  }
];
