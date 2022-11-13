import {NfcService} from "../nfc";
import {AuthService} from "../auth";
import {LedService} from "../led";
import {SlackService} from "../slack";
import {SesameService} from "../sesame";

export class MainService {
    constructor(
        private nfc: NfcService,
        private auth: AuthService,
        private sesame: SesameService,
        private slack?: SlackService,
        private led?: LedService,
    ) {
    }

    private addMode = false

    public start(): void {
        this.nfc.onTouch(async (id) => {
            const maskId = this.auth.maskId(id)
            // 管理用IDの場合
            if (this.auth.isMasterId(id)) {
                this.setAddMode(true)
                return
            }

            // 登録モード or 未登録
            if (this.addMode || this.auth.isEmpty()) {
                return this.onAddMode(id, maskId)
            }

            // 通常認証
            return this.onAuth(id, maskId)
        })
        this.slack?.postMessage("<!channel> NFCの監視を開始しました！")
    }

    private setAddMode(value: boolean): void {
        this.addMode = value;
        console.log(`setAddMode: ${value}`);
        if(value) {
            this.led?.blink(0.25, 0.5);
        } else {
            this.led?.stopBlink()
            this.led?.on(2)
        }
    }

    private async onAddMode(id: string, maskId: string): Promise<void> {
        if(this.auth.isValidId(id)) {
            //登録済みなので削除する
            this.auth.removeId(id)
            console.log(`remove id:${maskId}`)
            this.slack?.postMessage(`<!channel> 鍵を削除しました id:${maskId}`)
        } else {
            //登録する
            this.auth.addId(id)
            console.log(`Completion of registration id:${maskId}`)
            this.slack?.postMessage(`<!channel> 新しい鍵を登録しました id:${maskId}`)
        }
        this.setAddMode(false)
    }

    private async onAuth(id: string, maskId: string): Promise<void> {
        if(this.auth.isValidId(id)) {
            console.log("Authentication complete")
            this.led?.on()
            await this.sesame.toggle()
            this.led?.off(5); //5秒間は点灯させておく
        } else {
            console.log("Not authenticated");
            this.led?.blink(0.1, 0.5, 2)
            this.slack?.postMessage(`<!channel> この鍵は登録されていません id:${maskId}`)
        }
    }
}