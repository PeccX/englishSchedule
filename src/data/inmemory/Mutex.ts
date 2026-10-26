/** Exclusión mutua por cadena de promesas: simula la atomicidad de la transacción. */
export class Mutex {
  private tail: Promise<unknown> = Promise.resolve();

  runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = this.tail.then(task, task);
    this.tail = run.catch(() => undefined);
    return run;
  }
}
