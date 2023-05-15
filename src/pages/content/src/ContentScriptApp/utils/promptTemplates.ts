import { Command as XCommand } from "../xState/dragStateMachine";

export default function promptTemplates(text: string, command: XCommand) {
  switch (command) {
    case XCommand.RESEARCH:
      return `As a subject matter expert, research the following: "${text}"`;
    case XCommand.GENERATE_LANGUAGE:
      return `As a legal expert and experienced attorney, draft legal language for the following: "${text}"`;
    default:
      return text;
  }
}
