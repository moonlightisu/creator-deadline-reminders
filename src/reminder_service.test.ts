import test from "node:test";
import assert from "node:assert/strict";
import { reminderCronExpression, reminderRequest } from "./reminder_service.js";

test("places a deadline in the cron expression and rejects an empty audience", () => {
  assert.equal(reminderCronExpression(new Date("2030-05-20T16:30:00.000Z")), "30 16 20 5 *");
  assert.throws(() => reminderRequest.parse({ assetId: "a", title: "t", deadline: "2030-05-20T16:30:00.000Z", subscriberIds: [], webhookUrl: "https://x.test/hook" }));
});
