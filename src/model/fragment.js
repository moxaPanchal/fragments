const { randomUUID } = require('crypto');
const id = randomUUID(); // '30a84843-0cd4-4975-95ba-b96112aea189'
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');
// const data = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO
    if (typeof ownerId !== 'string') {
      throw new Error('Owner ID required');
    }
    this.ownerId = ownerId;

    if (id !== /[A-Za-z0-9_-]+/) {
      throw new Error('ID required');
    }
    this.id = id;

    this.created = created;
    this.updated = updated;

    if (type != 'text/plain' && type != 'text/plain; charset=utf-8') {
      throw new Error('Type required');
    }
    this.type = type;

    if (typeof size !== 'number') {
      throw new Error('Size must be a number');
    }
    if (size < 0) {
      throw new Error('Size cannot be negative');
    }
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // TODO
    // if (!Buffer.isBuffer(data)) {
    //   throw new Error('Not a buffer object');
    // }
    // this.size = data.length;
    // this.save();
    // return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */

  static async byId(ownerId, id) {
    id = this.id;
    // TODO
    return Promise.resolve(readFragment(ownerId, id));
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    id = this.id;
    // TODO
    return Promise.resolve(deleteFragment(ownerId, id));
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    // TODO
    return Promise();
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    // TODO
    return Promise.resolve(readFragmentData());
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    // TODO
    if (!Buffer.isBuffer(data)) {
      throw new Error('Not a buffer object');
    }
    this.size = data.length;
    this.save();
    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    // TODO
    if (this.mimeType() == 'text/*') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // TODO
    const acceptedFormats = ['text/plain', 'text/plain; charset=utf-8'];
    return acceptedFormats.values();
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // TODO
    if (value == 'text/plain' || value == 'text/plain; charset=utf-8') {
      return true;
    }
  }
}

module.exports.Fragment = Fragment;
