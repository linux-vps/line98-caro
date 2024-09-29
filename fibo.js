function fibo(n) {
    if (n <= 1) return;
    let fib = [BigInt(0), BigInt(1)];
    for (let i = 2; i <= n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
    }
    return fib[n];
}

console.time('thoi gian');
let result = fibo(100);
console.timeEnd('thoi gian');
console.log(result.toString());
