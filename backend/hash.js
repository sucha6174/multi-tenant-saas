import bcrypt from "bcrypt";

const hash = await bcrypt.hash("Demo@123", 10);
console.log(hash);
