import {WebAPICallResult, WebClient} from "@slack/web-api";

export class SlackService {
    private web: WebClient

    constructor(token: string, private channel: string) {
        this.web = new WebClient(token);
    }

    public postMessage(text: string): Promise<WebAPICallResult> {
        return this.web.chat.postMessage({
            text,
            channel: this.channel,
        })
    }

}