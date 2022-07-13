// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');

var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const supportedTypes = [
  'text/plain',
  'text/plain; charset=utf-8',
  'text/markdown',
  'application/json',
  'text/html',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO
    if (id) {
      this.id = id;
    } else {
      this.id = randomUUID();
    }

    if (ownerId) {
      this.ownerId = ownerId;
    } else {
      throw new Error();
    }

    if (Fragment.isSupportedType(type)) {
      this.type = type;
    } else {
      throw new Error();
    }

    if (size < 0 || typeof size === 'string') {
      throw new Error(`size can't be negative`);
    } else {
      this.size = size;
    }

    if (created) {
      this.created = created;
    } else {
      this.created = new Date().toISOString();
    }
    if (updated) {
      this.updated = updated;
    } else {
      this.updated = new Date().toISOString();
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      const fragments = await listFragments(ownerId, expand);
      if (expand) {
        return fragments.map((fragment) => new Fragment(fragment));
      }
      return fragments;
    } catch (err) {
      return [];
    }
  }
  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    logger.info({ ownerId, id }, 'byId()');
    try {
      return new Fragment(await readFragment(ownerId, id));
    } catch (error) {
      throw new Error('unable to find fragment by that id');
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    try {
      return new Promise((resolve, reject) => {
        readFragmentData(this.ownerId, this.id)
          .then((data) => resolve(Buffer.from(data)))
          .catch(() => {
            reject(new Error());
          });
      });
    } catch (err) {
      throw new Error(`unable to get data`);
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!data) {
      throw new Error();
    } else {
      this.updated = new Date().toISOString();
      this.size = Buffer.byteLength(data);
      await writeFragment(this);
      return await writeFragmentData(this.ownerId, this.id, data);
    }
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
    let result = this.mimeType.startsWith('text/');
    return result;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let result = [];
    if (
      this.type.includes('image/png') ||
      this.type.includes('image/jpeg') ||
      this.type.includes('image/gif') ||
      this.type.includes('image/webp')
    ) {
      result = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    } else if (this.type.includes('text/plain')) {
      result = ['text/plain'];
    } else if (this.type.includes('text/markdown')) {
      result = ['text/plain', 'text/html', 'text/markdown'];
    } else if (this.type.includes('text/html')) {
      result = ['text/plain', 'text/html'];
    } else if (this.type.includes('application/json')) {
      result = ['application/json', 'text/plain'];
    }
    //return empty array if the type is not supported
    return result;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    let result;
    if (supportedTypes.includes(value)) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }

  /**
   * Gets the fragment's data from the database
   * @param {string} value a convert type value
   * @returns result
   */

  async txtConvert(value) {
    var result, fragData;
    fragData = await this.getData();
    if (value == 'plain') {
      if (this.type == 'application/json') {
        result = JSON.parse(fragData);
      } else {
        result = fragData;
      }
    } else if (value == 'html') {
      if (this.type.endsWith('markdown')) {
        result = md.render(fragData.toString());
      }
    }
    return result;
  }

  async imgConvert(value) {
    var result, fragData;
    fragData = await this.getData();

    if (this.type.startsWith('image')) {
      if (value == 'gif') {
        result = await sharp(fragData).gif();
      } else if (value == 'jpg' || value == 'jpeg') {
        result = await sharp(fragData).jpeg();
      } else if (value == 'webp') {
        result = await sharp(fragData).webp();
      } else if (value == 'png') {
        result = await sharp(fragData).png();
      }
    }
    return result.toBuffer();
  }

  extConvert(value) {
    var ext;
    if (value == 'txt') {
      ext = 'plain';
    } else if (value == 'jpg') {
      ext = 'jpeg';
    } else if (value == 'md') {
      ext = 'markdown';
    } else {
      ext = value;
    }
    return ext;
  }
}
module.exports.Fragment = Fragment;
