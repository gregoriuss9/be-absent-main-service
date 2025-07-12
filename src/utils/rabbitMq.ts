import amqp from "amqplib";
let channel: amqp.Channel;

const QUEUE_NAME = "checkin-events";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const initRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(
      "🐰 RabbitMQ channel connected and queue declared:",
      QUEUE_NAME
    );
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
  }
};

export const publishCheckInEvent = async (data: any) => {
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel is not ready");
    return;
  }
  const message = Buffer.from(JSON.stringify(data));
  channel.sendToQueue(QUEUE_NAME, message);
};
