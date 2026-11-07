const test = require('node:test');
const assert = require('node:assert/strict');
const { enableAuthorization, isAuthorizationEnabled } = require('../src/db/enable_auth');

test('enables authorization when the security section is missing', () => {
    const config = 'storage:\n  dbPath: /var/lib/mongodb\n';
    const updated = enableAuthorization(config);

    assert.equal(updated, 'storage:\n  dbPath: /var/lib/mongodb\n\nsecurity:\n  authorization: enabled\n');
    assert.equal(isAuthorizationEnabled(updated), true);
});

test('updates a disabled authorization setting and keeps its comment', () => {
    const config = 'security:\n  authorization: disabled # local setup\nnet:\n  port: 27017\n';
    const updated = enableAuthorization(config);

    assert.equal(updated, 'security:\n  authorization: enabled # local setup\nnet:\n  port: 27017\n');
    assert.equal(isAuthorizationEnabled(config), false);
    assert.equal(isAuthorizationEnabled(updated), true);
});

test('preserves Windows line endings', () => {
    const config = 'security:\r\n  authorization: disabled\r\n';
    assert.equal(enableAuthorization(config), 'security:\r\n  authorization: enabled\r\n');
});

test('handles a UTF-8 BOM in the MongoDB config', () => {
    const config = '\uFEFFsecurity:\n  authorization: disabled\n';
    const updated = enableAuthorization(config);

    assert.equal(updated, '\uFEFFsecurity:\n  authorization: enabled\n');
    assert.equal(isAuthorizationEnabled(updated), true);
});

test('rejects inline security configuration rather than rewriting it unsafely', () => {
    assert.throws(
        () => enableAuthorization('security: { authorization: disabled }\n'),
        /inline security value/,
    );
});
