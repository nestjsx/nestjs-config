class TestType {
  number: number;
  string: string;

  constructor(number: number, string: string) {
    this.string = string;
    this.number = number;
  }
};

export default new TestType(123, "1234");
