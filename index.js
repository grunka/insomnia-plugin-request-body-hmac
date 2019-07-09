const crypto = require('crypto');

const replacementContent = 'Will be replaced with HMAC of request body';
const settings = {
  key: null,
  algorithm: null,
  encoding: null
};

function hmac(content) {
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
  run(context, algorithm, encoding, key = '', value = '') {
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
  }
];
