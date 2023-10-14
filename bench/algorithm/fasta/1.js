// The Computer Language Benchmarks Game
// https://salsa.debian.org/benchmarksgame-team/benchmarksgame/
//
//  Contributed by Ian Osgood
//  Modified for typescript deno by hanabi1224

let last = 42;
const A = 3877, C = 29573, M = 139968;
const CHUNK_SIZE = 60;

function rand(max) {
    last = (last * A + C) % M;
    return max * last / M;
}

const ALU =
    "GGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGG" +
    "GAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGA" +
    "CCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAAT" +
    "ACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCA" +
    "GCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGG" +
    "AGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCC" +
    "AGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAA";

const IUB = {
    dict: new Uint8Array([
        "a".charCodeAt(0), "c".charCodeAt(0), "g".charCodeAt(0), "t".charCodeAt(0),
        "B".charCodeAt(0), "D".charCodeAt(0), "H".charCodeAt(0), "K".charCodeAt(0),
        "M".charCodeAt(0), "N".charCodeAt(0), "R".charCodeAt(0), "S".charCodeAt(0),
        "V".charCodeAt(0), "W".charCodeAt(0), "Y".charCodeAt(0),
    ]),
    freq: new Float64Array([
        0.27, 0.12, 0.12, 0.27,
        0.02, 0.02, 0.02, 0.02,
        0.02, 0.02, 0.02, 0.02,
        0.02, 0.02, 0.02,
    ]),
};

const HomoSap = {
    dict: new Uint8Array([
        "a".charCodeAt(0),
        "c".charCodeAt(0),
        "g".charCodeAt(0),
        "t".charCodeAt(0),
    ]),
    freq: new Float64Array([
        0.3029549426680,
        0.1979883004921,
        0.1975473066391,
        0.3015094502008,
    ]),
}

function fastaRepeat(n = 0, seq = "") {
    let seqi = 0, lenOut = CHUNK_SIZE;
    const seqseq = seq + seq.slice(0, CHUNK_SIZE);
    process.stdout.cork();
    while (n > 0) {
        if (n < lenOut) lenOut = n;
        process.stdout.write(seqseq.substring(seqi, seqi + lenOut));
        process.stdout.write("\n");
        seqi += lenOut;
        if (seqi > seq.length) {
            seqi -= seq.length;
        }
        n -= lenOut;
    }
    process.stdout.uncork();
}

function makeCumulative(freq = new Float64Array) {
    for (let i = 1; i < freq.length; i++) {
        freq[i] += freq[i-1];
    }
}

function fastaRandom(n = 0, table = { dict: new Uint8Array, freq: new Float64Array }) {
    const { dict, freq } = table;
    const line = new Uint8Array(CHUNK_SIZE + 1);
    const size = freq.length;
    makeCumulative(freq);
    process.stdout.cork();
    while (n > 0) {
        const cnt = n < CHUNK_SIZE ? n : CHUNK_SIZE;
        for (let i = 0; i < cnt; i++) {
            const r = rand(1);
            for (let j = 0; j < size; j++) {
                if (r < freq[j]) {
                    line[i] = dict[j];
                    break;
                }
            }
        }
        const buffer = n < CHUNK_SIZE ? line.subarray(0, n) : line;
        process.stdout.write(buffer, "ascii");
        process.stdout.write('\n');
        n -= line.length;
    }
    process.stdout.uncork();
}

function main() {    
    const n = +process.argv[2];

    process.stdout.write(">ONE Homo sapiens alu\n")
    fastaRepeat(2 * n, ALU)

    process.stdout.write(">TWO IUB ambiguity codes\n")
    fastaRandom(3 * n, IUB)

    process.stdout.write(">THREE Homo sapiens frequency\n")
    fastaRandom(5 * n, HomoSap)
}

console.time();
main();
console.timeEnd();
