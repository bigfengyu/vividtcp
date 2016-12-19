export class FakeData {
  constructor(addTime, data, transState) {
    this.addTime = addTime;
    this.rawData = data;
    this.transState = transState ? transState : 'random';
  }
}
