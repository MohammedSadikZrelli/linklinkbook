const { puter } = require('@heyputer/puter.js');

async function test() {
  try {
    const result = await puter.ai.txt2img("A beautiful book cover", { model: "black-forest-labs/flux-1.1-pro" });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
test();
