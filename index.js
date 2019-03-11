const typeMapping = {
  string: 'string',
  null: 'null',
  boolean: 'boolean',
  int: 'integer',
  float: 'number',
  enum: 'string',
};

function isString(value) {
  return typeof value === 'string';
}

function isObject(value) {
  return typeof value === 'object';
}

function isArray(value) {
  return Array.isArray(value);
}

/**
 *
 */
const avroJsonSchema = () => {
  const recordMapping = {};
  /**
   *
   */
  const convert = avroSpec => {
    if (!avroSpec) {
      return {};
    }
    const baseRecord = convertAny(avroSpec);
    return baseRecord.field;
  };

  /**
   *
   */
  const convertAny = aType => {
    let expanded = false;
    while (!expanded) {
      const rootName = aType.name;
      console.log(aType);
      console.log('-- expanding', rootName);
      const type = aType.type;
      if (isArray(type)) {
        aType = type.filter(t => t !== 'null')[0];
        if (!aType.name) {
          aType.name = rootName;
        }
        console.log('-- an array', aType.name);
      } else if (isObject(type)) {
        aType = type;
        if (!aType.name) {
          aType.name = rootName;
        }
        console.log('-- a object', aType.name);
      } else if (type.name && recordMapping[type.name]) {
        aType = recordMapping[type.name];
        console.log('-- a mapped record', aType.name);
      } else {
        console.log('- expanded');
        expanded = true;
      }
    }

    console.log('t:', aType.type);

    switch (aType.type) {
      case 'array':
        return convertArray(aType);
      case 'record':
        return convertRecord(aType);
      case 'enum':
        return convertEnum(aType);
      default:
        return convertPrimitive(aType);
    }
  };

  /**
   *
   */
  const toTitle = name => {
    return name;
  };

  /**
   *
   */
  const convertRecord = recordType => {
    const id = recordType.name;
    console.log('converting record: ', id);
    const field = { type: 'object', title: toTitle(id) };
    const properties = recordType.fields.map(field => convertAny(field));
    field.properties = properties.reduce((obj, item) => {
      obj[item.id] = item.field;
      return obj;
    }, {});

    recordMapping[id] = field;

    return { id, field };
  };

  /**
   *
   */
  const convertArray = arrayType => {
    const id = arrayType.name;
    console.log('converting array: ', id);
    const field = { type: 'array', title: toTitle(id) };
    field.items = isString(arrayType.items)
      ? createPrimitive(arrayType.items)
      : convertAny(arrayType.items).field;

    return { id, field };
  };

  /**
   *
   */
  const convertEnum = enumType => {
    const id = enumType.name;
    const field = { type: typeMapping['enum'], enum: enumType.symbols, title: toTitle(id) };

    return { id, field };
  };

  const createPrimitive = primitiveTypeName => {
    return { type: typeMapping[primitiveTypeName] };
  };

  /**
   *
   */
  const convertPrimitive = primitiveType => {
    primitiveType.type = primitiveType.type || 'string';
    primitiveType.name = primitiveType.name || 'unknown';
    const id = primitiveType.name;
    const field = { title: toTitle(id), type: typeMapping[primitiveType.type] };
    if (primitiveType.doc) {
      field.description = primitiveType.doc;
    }

    return { id, field };
  };

  return { convert, convertPrimitive, convertEnum, convertArray, convertRecord };
};

export default avroJsonSchema();
