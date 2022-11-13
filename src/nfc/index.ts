import NfcpyId from "node-nfcpy-id"

export type NfcListener = (id: string) => Promise<void>

export class NfcService {
    private nfc: NfcpyId

    constructor() {
        this.nfc = new NfcpyId({scriptPath: __dirname, scriptFile: 'pasori.py'}).start(); // loop mode
    }

    public onTouch(handleTouch: NfcListener) {
        this.nfc.on("touchstart", async (card: any) => {
            const id = card.id;
            console.log('touchstart', 'id:', id, 'type:', card.type);
            await handleTouch(id)
        });
    }
}