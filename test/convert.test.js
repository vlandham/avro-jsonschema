const test = require('tape');
const a = require('../');

test('sanity', t => {
  t.equal(1, 1);
  t.end();
});

test('base', t => {
  const out = a.convert();
  t.deepEqual(out, {});
  t.end();
});

test('convertPrimitive', t => {
  t.equal(a.convertPrimitive({ name: 'target', type: 'int' }).id, 'target');
  t.deepEqual(a.convertPrimitive({ name: 'target', type: 'int' }).field, {
    title: 'target',
    type: 'integer',
  });
  t.end();
});

test('convertEnum', t => {
  const enumType = { name: 'etarget', type: 'enum', symbols: ['a', 'b', 'c'] };
  t.equal(a.convertEnum(enumType).id, 'etarget');
  t.deepEqual(a.convertEnum(enumType).field, {
    title: 'etarget',
    type: 'string',
    enum: ['a', 'b', 'c'],
  });
  t.end();
});

test('convertArray', t => {
  t.test('basic array', st => {
    const aType = { name: 'a', type: 'array', items: { type: 'string', name: 'b' } };
    st.equal(a.convertArray(aType).id, 'a');
    st.deepEqual(a.convertArray(aType).field, {
      title: 'a',
      type: 'array',
      items: { type: 'string', title: 'b' },
    });
    st.end();
  });
  t.test('array of objects', st => {
    const aType = {
      name: 'a',
      type: 'array',
      items: { type: 'record', name: 'b', fields: [{ type: 'string', name: 'c' }] },
    };
    st.deepEqual(a.convertArray(aType).field, {
      title: 'a',
      type: 'array',
      items: { type: 'object', title: 'b', properties: { c: { type: 'string', title: 'c' } } },
    });
    st.end();
  });
  t.end();
});

test('convertRecord', t => {
  t.test('basic record', st => {
    const recType = { name: 'a', type: 'record', fields: [{ type: 'string', name: 'b' }] };
    st.deepEqual(a.convertRecord(recType).field, {
      title: 'a',
      type: 'object',
      properties: { b: { type: 'string', title: 'b' } },
    });
    st.end();
  });

  t.test('multi fields record', st => {
    const recType = {
      name: 'a',
      type: 'record',
      fields: [{ type: 'string', name: 'b' }, { type: 'int', name: 'c' }],
    };
    st.deepEqual(a.convertRecord(recType).field, {
      title: 'a',
      type: 'object',
      properties: {
        b: { type: 'string', title: 'b' },
        c: { type: 'integer', title: 'c' },
      },
    });
    st.end();
  });

  t.end();
});
