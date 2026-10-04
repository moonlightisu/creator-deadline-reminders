import { z } from "zod";
import { infrai } from "./infrai.js";

export const reminderRequest = z.object({
  assetId: z.string().min(1),
  title: z.string().min(1),
  deadline: z.string().datetime(),
  subscriberIds: z.array(z.string().min(1)).min(1),
  webhookUrl: z.string().url()
});
export type ReminderRequest = z.infer<typeof reminderRequest>;

export function reminderCronExpression(deadline: Date): string {
  const hour = deadline.getUTCHours();
  const minute = deadline.getUTCMinutes();
  return `${minute} ${hour} ${deadline.getUTCDate()} ${deadline.getUTCMonth() + 1} *`;
}

export async function scheduleReminder(input: unknown) {
  const request = reminderRequest.parse(input);
  const job = await infrai.cron.create({ cron_expr: reminderCronExpression(new Date(request.deadline)), task: request.webhookUrl });
  const message = await infrai.queue.publish("creator-deadline-reminders", JSON.stringify({
    type: "creator-deadline-reminder",
    assetId: request.assetId,
    title: request.title,
    deadline: request.deadline,
    subscriberIds: request.subscriberIds,
    jobId: job.job_id
  }));
  return { jobId: job.job_id, messageId: message.message_id };
}

if (process.argv[1]?.endsWith("reminder_service.ts")) {
  const sample = { assetId: "pack-42", title: "Video pack delivery", deadline: "2030-05-20T16:30:00.000Z", subscriberIds: ["sub-7"], webhookUrl: "https://creator.example/reminders" };
  scheduleReminder(sample).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
