/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const CommonProto = $root.CommonProto = (() => {

    /**
     * Namespace CommonProto.
     * @exports CommonProto
     * @namespace
     */
    const CommonProto = {};

    CommonProto.User = (function() {

        /**
         * Properties of a User.
         * @typedef {Object} CommonProto.User.$Properties
         * @property {string|null} [firstName] User firstName
         * @property {string|null} [lastName] User lastName
         * @property {boolean|null} [active] User active
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a User.
         * @memberof CommonProto
         * @interface IUser
         * @augments CommonProto.User.$Properties
         * @deprecated Use CommonProto.User.$Properties instead.
         */

        /**
         * Shape of a User.
         * @typedef {CommonProto.User.$Properties} CommonProto.User.$Shape
         */

        /**
         * Constructs a new User.
         * @memberof CommonProto
         * @classdesc Represents a User.
         * @constructor
         * @param {CommonProto.User.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function User(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User firstName.
         * @member {string} firstName
         * @memberof CommonProto.User
         * @instance
         */
        User.prototype.firstName = "";

        /**
         * User lastName.
         * @member {string} lastName
         * @memberof CommonProto.User
         * @instance
         */
        User.prototype.lastName = "";

        /**
         * User active.
         * @member {boolean} active
         * @memberof CommonProto.User
         * @instance
         */
        User.prototype.active = false;

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof CommonProto.User
         * @static
         * @param {CommonProto.User.$Properties=} [properties] Properties to set
         * @returns {CommonProto.User} User instance
         * @type {{
         *   (properties: CommonProto.User.$Shape): CommonProto.User & CommonProto.User.$Shape;
         *   (properties?: CommonProto.User.$Properties): CommonProto.User;
         * }}
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link CommonProto.User.verify|verify} messages.
         * @function encode
         * @memberof CommonProto.User
         * @static
         * @param {CommonProto.User.$Properties} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.firstName != null && Object.hasOwnProperty.call(message, "firstName"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.firstName);
            if (message.lastName != null && Object.hasOwnProperty.call(message, "lastName"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.lastName);
            if (message.active != null && Object.hasOwnProperty.call(message, "active"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.active);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link CommonProto.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof CommonProto.User
         * @static
         * @param {CommonProto.User.$Properties} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof CommonProto.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {CommonProto.User & CommonProto.User.$Shape} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.CommonProto.User(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.firstName = value;
                        else
                            delete message.firstName;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.lastName = value;
                        else
                            delete message.lastName;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.bool())
                            message.active = value;
                        else
                            delete message.active;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof CommonProto.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {CommonProto.User & CommonProto.User.$Shape} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof CommonProto.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.firstName != null && message.hasOwnProperty("firstName"))
                if (!$util.isString(message.firstName))
                    return "firstName: string expected";
            if (message.lastName != null && message.hasOwnProperty("lastName"))
                if (!$util.isString(message.lastName))
                    return "lastName: string expected";
            if (message.active != null && message.hasOwnProperty("active"))
                if (typeof message.active !== "boolean")
                    return "active: boolean expected";
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof CommonProto.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {CommonProto.User} User
         */
        User.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.CommonProto.User)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            let message = new $root.CommonProto.User();
            if (object.firstName != null)
                if (typeof object.firstName !== "string" || object.firstName.length)
                    message.firstName = String(object.firstName);
            if (object.lastName != null)
                if (typeof object.lastName !== "string" || object.lastName.length)
                    message.lastName = String(object.lastName);
            if (object.active != null)
                if (object.active)
                    message.active = Boolean(object.active);
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof CommonProto.User
         * @static
         * @param {CommonProto.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.firstName = "";
                object.lastName = "";
                object.active = false;
            }
            if (message.firstName != null && message.hasOwnProperty("firstName"))
                object.firstName = message.firstName;
            if (message.lastName != null && message.hasOwnProperty("lastName"))
                object.lastName = message.lastName;
            if (message.active != null && message.hasOwnProperty("active"))
                object.active = message.active;
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof CommonProto.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for User
         * @function getTypeUrl
         * @memberof CommonProto.User
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        User.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/CommonProto.User";
        };

        return User;
    })();

    return CommonProto;
})();

export {
  $root as default
};
