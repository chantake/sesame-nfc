import fs from "fs";

export class AuthService {
    private ids: string[]

    constructor(private fileName = "ids.txt", private newLine = "\n") {
        try {
            // ファイルから読み込み
            const text = fs.readFileSync(fileName, "utf-8");
            this.ids = text.split(newLine);
        } catch(e) {
        }
        this.ids = [];
    }

    public isEmpty(): boolean {
        return this.ids.length === 0
    }

    public addId(id: string): void {
        try {
            fs.appendFileSync(this.fileName, `${id}${this.newLine}`);
            this.ids.push(id);
        } catch(e) {
            console.log(e);
        }
    }

    public removeId(id: string): void {
        this.ids = this.ids.filter(n => n !== id && n.length > 0);
        this.updateIds();
    }

    private updateIds(): void {
        try {
            fs.unlinkSync(this.fileName);
            this.ids.forEach((id) => {
                this.addId(id);
            });
        } catch(e) {
            console.log(e);
        }
    }

    public isMasterId(id: string): boolean {
        return this.ids[0] === id
    }

    public isValidId(id: string): boolean {
        return this.ids.indexOf(id) !== -1
    }

    public maskId(id: string): string {
        return id.slice(0, 5) + "*".repeat(id.length - 4);
    }
}