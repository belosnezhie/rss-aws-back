import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export class MockSNSClient extends SNSClient {
  public invocationStack: PublishCommand[] = []

  async send(command: PublishCommand) {
    this.invocationStack.push(command);
  }
}
