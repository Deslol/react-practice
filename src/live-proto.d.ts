import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace CommonProto. */
export namespace CommonProto {

    /**
     * Properties of a User.
     * @deprecated Use CommonProto.User.$Properties instead.
     */
    interface IUser extends CommonProto.User.$Properties {
    }

    /** Represents a User. */
    class User {

        /**
         * Constructs a new User.
         * @param [properties] Properties to set
         */
        constructor(properties?: CommonProto.User.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** User firstName. */
        firstName: string;

        /** User lastName. */
        lastName: string;

        /** User active. */
        active: boolean;

        /**
         * Creates a new User instance using the specified properties.
         * @param [properties] Properties to set
         * @returns User instance
         */
        static create(properties: CommonProto.User.$Shape): CommonProto.User & CommonProto.User.$Shape;
        static create(properties?: CommonProto.User.$Properties): CommonProto.User;

        /**
         * Encodes the specified User message. Does not implicitly {@link CommonProto.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: CommonProto.User.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link CommonProto.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: CommonProto.User.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a User message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {CommonProto.User & CommonProto.User.$Shape} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CommonProto.User & CommonProto.User.$Shape;

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {CommonProto.User & CommonProto.User.$Shape} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CommonProto.User & CommonProto.User.$Shape;

        /**
         * Verifies a User message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns User
         */
        static fromObject(object: { [k: string]: any }): CommonProto.User;

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @param message User
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: CommonProto.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this User to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for User
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace User {

        /** Properties of a User. */
        interface $Properties {

            /** User firstName */
            firstName?: (string|null);

            /** User lastName */
            lastName?: (string|null);

            /** User active */
            active?: (boolean|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a User. */
        type $Shape = CommonProto.User.$Properties;
    }
}
