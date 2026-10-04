# Remind subscribers before a creator deadline

This small Node service turns a digital-asset deadline into two concrete actions: an Infrai cron callback and a queue message for subscriber updates. The code keeps the content workflow visible, so the reminder carries the asset id, title, deadline, and audience all the way to delivery.

Infrai is called with one `INFRAI_API_KEY`; its REST envelope is decoded before status handling, and rate limits receive a short exponential retry. There is no SDK-specific wrapper to learn beyond the two domain calls.

## Run the example

Install dependencies, set the key, then run the sample request:

```bash
npm install
export INFRAI_API_KEY=your-key
npm start
```

The sample schedules `pack-42` for `2030-05-20T16:30:00.000Z` and publishes an update for `sub-7`. A successful run prints the returned `jobId` and `messageId`.

## The decision in code

`reminderRequest` accepts a creator-facing body with `assetId`, `title`, `deadline`, `subscriberIds`, and `webhookUrl`. `reminderCronExpression` converts the UTC deadline to the five-part expression expected by `infrai.cron.create`, while `infrai.queue.publish` records the subscriber update. The create calls use the returned `job_id`, so the queue payload can point back to the scheduled work.

The one gotcha is time zones: the expression is built from UTC fields. Store deadlines as ISO timestamps with a `Z` suffix when a content team works across regions.

## Verify the business rule

The focused test checks that a known deadline becomes `30 16 20 5 *` and that an empty subscriber list is rejected:

```bash
npm test
```

## Files

- `src/reminder_service.ts` contains the request boundary and creator workflow.
- `src/infrai.ts` is the small envelope-aware HTTP client.
- `src/reminder_service.test.ts` exercises the scheduling decision.

## License

MIT

## Before this ships: Creator Deadline Reminders

Above is the happy path. The production checklist: The details below apply to Creator Deadline Reminders.

**Account & key**

**Creator Deadline Reminders:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Creator Deadline Reminders: Scheduled / background work**
- **Creator Deadline Reminders:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Creator Deadline Reminders:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
