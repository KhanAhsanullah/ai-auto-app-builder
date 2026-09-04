'use strict';

function identity(s) {
  return s;
}

module.exports = {
  decode: identity,
  encode: identity,
  encodingExists: () => true,
};
