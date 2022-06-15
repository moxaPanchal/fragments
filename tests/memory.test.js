const data = require('../src/model/data/memory/index');
const MemoryDB = require('../src/model/data/memory/memory-db');

describe('In-memory databases', () => {
  let customFragment = {
    id: 'V1StGXR8_Z5jdHi6B-myT',
    ownerId: '0925f997',
    created: '2021-11-02T15:09:50.403Z',
    updated: '2021-11-02T15:09:50.403Z',
    type: 'text/plain',
    size: 256,
  };

  test('write fragment metadata to memory db', async () => {
    const write = await data.writeFragment(customFragment);
    expect(write).toBe(undefined);
  });

  test('read fragment metadata to memory db', async () => {
    await data.writeFragment(customFragment);

    const read = await data.readFragment(customFragment.ownerId, customFragment.id);
    expect(read).toEqual(customFragment);
  });

  test('Write a fragment data to memory db', async () => {
    const fragmentData = Buffer.from([customFragment.id, customFragment.ownerId]);
    const writeData = await data.writeFragmentData(
      customFragment.ownerId,
      customFragment.id,
      fragmentData
    );
    expect(writeData).toBe(undefined);
  });

  test('Read a fragments data from memory db', async () => {
    const fragmentData = Buffer.from([customFragment.id, customFragment.ownerId]);

    await data.writeFragmentData(customFragment.ownerId, customFragment.id, fragmentData);

    const readData = await data.readFragmentData(customFragment.ownerId, customFragment.id);

    expect(readData).toBe(fragmentData);
  });
});
