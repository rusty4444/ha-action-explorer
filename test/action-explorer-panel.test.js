import test from "node:test";
import assert from "node:assert/strict";

import { actionExample, formatFieldCount } from "../src/utils.js";

test("formatFieldCount pluralises service fields", () => {
  assert.equal(formatFieldCount({}), "0 fields");
  assert.equal(formatFieldCount({ brightness: {} }), "1 field");
  assert.equal(formatFieldCount({ brightness: {}, transition: {} }), "2 fields");
});

test("actionExample builds an automation API payload", () => {
  assert.deepEqual(actionExample({ service: "light.turn_on", example_data: { brightness_pct: 70 } }), {
    entity_id: "light.kitchen",
    service: "light.turn_on",
    service_data: { brightness_pct: 70 },
    alias: "Run light.turn_on for light.kitchen",
  });
});
