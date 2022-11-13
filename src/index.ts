import {MainService} from "./main";
import {NfcService} from "./nfc";
import {AuthService} from "./auth";
import {SesameService} from "./sesame";
import config from "../config.json"
import {SlackService} from "./slack";
import {LedService} from "./led";

const main = async (): Promise<void> => {
    const nfcService = new NfcService()
    const authService = new AuthService()

    if (!config.sesame || !config.sesame.apiKey || !config.sesame.devices) {
        console.error("sesame設定が見つかりません")
        return
    }
    const sesameService = new SesameService(config.sesame.apiKey, config.sesame.devices)

    const slackService = (() => {
        const sc = config.slack
        if (sc && sc.token && sc.channel) {
            console.info("slack設定が見つかりました！")
            return new SlackService(sc.token, sc.channel)
        }
    })()

    const ledService = (() => {
        if (config.led) {
            console.info("led設定が見つかりました！")
            return new LedService()
        }
    })()

    const mainService = new MainService(nfcService, authService, sesameService, slackService, ledService)
    mainService.start()

    process.on("exit", () => {
        ledService?.exit()
    })
    process.on("SIGINT", () => {
        process.exit(0)
    })
}

main().then()