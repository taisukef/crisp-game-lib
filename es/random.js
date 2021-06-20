export class Random {
    constructor(seed = null) {
        this.setSeed(seed);
    }
    get(lowOrHigh = 1, high) {
        if (high == null) {
            high = lowOrHigh;
            lowOrHigh = 0;
        }
        return (this.next() / 0xffffffff) * (high - lowOrHigh) + lowOrHigh;
    }
    getInt(lowOrHigh, high) {
        if (high == null) {
            high = lowOrHigh;
            lowOrHigh = 0;
        }
        if (high === lowOrHigh) {
            return lowOrHigh;
        }
        return (this.next() % (high - lowOrHigh)) + lowOrHigh;
    }
    getPlusOrMinus() {
        return this.getInt(2) * 2 - 1;
    }
    select(values) {
        return values[this.getInt(values.length)];
    }
    setSeed(w, x = 123456789, y = 362436069, z = 521288629, loopCount = 32) {
        this.w = w != null ? w >>> 0 : Math.floor(Math.random() * 0xffffffff) >>> 0;
        this.x = x >>> 0;
        this.y = y >>> 0;
        this.z = z >>> 0;
        for (let i = 0; i < loopCount; i++) {
            this.next();
        }
        return this;
    }
    getState() {
        return { x: this.x, y: this.y, z: this.z, w: this.w };
    }
    next() {
        const t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
        return this.w;
    }
}
