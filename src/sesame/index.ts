import axios, {AxiosPromise} from "axios"
const aesCmac = require('node-aes-cmac').aesCmac
import {SesameCMD} from "./cmd"
import {SesameDevice} from "./type";

export class SesameService {
    constructor(private apiKey: string, private devices: SesameDevice[]) {
    }

    private sendAPI(uuid: string, secret: string, cmd: SesameCMD): AxiosPromise {
        const history = generateHistory("Toggled via API")
        const sign = generateRandomTag(secret)
        return axios({
            method: 'post',
            url: `https://app.candyhouse.co/api/sesame2/${uuid}/cmd`,
            headers: {'x-api-key': this.apiKey},
            data: {
                cmd, history, sign
            }
        })
    }

    private async exec(cmd: SesameCMD): Promise<void> {
        try {
            await Promise.all(this.devices.map(({ uuid, secret }) => {
                return this.sendAPI(uuid, secret, cmd)
            }))
        } catch (e) {
            console.warn(e)
        }
    }

    public toggle(): Promise<void> { return this.exec(SesameCMD.Toggle) }
    public lock(): Promise<void> { return this.exec(SesameCMD.Lock) }
    public unLock(): Promise<void> { return this.exec(SesameCMD.UnLock) }
}

const generateHistory = (value: string) => {
    return Buffer.from(value).toString('base64')
}

const generateRandomTag = (secret: string) => {
    const key = Buffer.from(secret, 'hex')
    const date = Math.floor(Date.now() / 1000);
    const dateDate = Buffer.allocUnsafe(4);
    dateDate.writeUInt32LE(date, 0);
    const message = Buffer.from(dateDate.slice(1, 4));
    return aesCmac(key, message);
}