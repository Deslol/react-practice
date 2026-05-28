// import {create, fromBinary, toBinary, toJson} from "@bufbuild/protobuf"
// import {UserSchema} from "./src/gen/user_pb";
//
// const user = create(UserSchema, {
//     firstName: "John",
//     lastName: "Doe",
//     active: true
// })
// console.log(user)
//
// const bytes = toBinary(UserSchema, user)
// console.log("binary:", bytes)
//
// const decoded = fromBinary(UserSchema, bytes);
// console.log(decoded)
//
// const json = toJson(UserSchema, user);
// console.log("json:", json)

import * as Proto from "./src/live-proto"

const user = Proto.CommonProto.User.create({
    firstName: "John",
    lastName: "Doe",
    active: true
})
const buffer = Proto.CommonProto.User.encode(user).finish();
const decoded = Proto.CommonProto.User.decode(buffer)

console.log("user:", user);
console.log("buffer:", buffer);
console.log("decoded:", decoded);