const bcrypt = require("bcrypt");

(async () => {
  const password = "Demo@123";

  const hash = await bcrypt.hash(password, 10);
  console.log("HASH:", hash);

  const result = await bcrypt.compare(password, hash);
  console.log("RESULT:", result);
})();
