import { Gpio } from "onoff"

export class LedService {
    private led: Gpio
    private interval?: NodeJS.Timer
    private timer?: NodeJS.Timer

    constructor(private intervalSec = 6) {
        this.led = new Gpio(23, "out");
    }

    public startInterval(): void {
        // led点灯
        this.interval = setInterval(_ => {
            if(!this.timer) {
                this.on(0.05);
            }
        }, 1000 * this.intervalSec);
    }

    public stopInterval(): void {
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    public init(): void {
        this.startInterval()
        // 終了処理を登録
        process.on("exit", () => {
            this.exit()
        })
    }

    public exit(): void {
        this.stopBlink();
        this.stopInterval();
        this.led.writeSync(0);// LEDをOFF
        this.led.unexport();// GPIOポートを解放
    }

    public on(sec = 0): void {
        this.led.writeSync(1);
        if(sec > 0) {
            this.off(sec);
        }
    }

    public off(delay = 0): void {
        setTimeout(_ => {
            this.led.writeSync(0);
        }, 1000 * delay);
    }

    public blink(sec: number, interval: number, lentgh = 0): void {
        if(this.timer) {
            stop();
        }

        this.timer = setInterval(_ => {
            this.on(sec);
        }, interval * 1000);

        if(lentgh > 0) {
            setTimeout(_ => {
                this.stopBlink();
            }, 1000 * lentgh);
        }
    }

    public stopBlink(): void {
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
}