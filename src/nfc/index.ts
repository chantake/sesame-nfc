import NfcpyId from "node-nfcpy-id"

export type NfcListener = (id: string) => Promise<void>

export class NfcService {
    private nfc: NfcpyId
    private isTouched = false

    constructor() {
        this.nfc = new NfcpyId({scriptPath: __dirname, scriptFile: 'pasori.py'}).start(); // loop mode
    }

    public onTouch(handleTouch: NfcListener) {
        this.nfc.on("touchstart", async (card: any) => {
            // タッチ途中の場合は処理しない
            if (this.isTouched)
                return

            // タッチ途中にする
            this.setTouched()
            const id = card.id
            console.log('touchstart', 'id:', id, 'type:', card.type)
            await handleTouch(id)
        });
    }

    /**
     * 設定した秒数タッチ状態にする
     * @param sec
     * @private
     */
    private setTouched(sec = 6) {
        this.isTouched = true
        setTimeout(() => {
            this.isTouched = false
        }, 1000 * 6)
    }
}