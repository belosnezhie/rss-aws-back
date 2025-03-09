import { innerHandler } from "../../lambdaFunctions/importFileParser";
import { customS3Event } from "./testData";

describe('importFileParser lambda function', () => {
  let consoleLogMock = jest.spyOn(global.console, 'log');

  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log');
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it('happy path', async () => {
    const getFileContentInner = jest.fn(async (bucket: string, filePath: string) => "column1,column2\nvalue1,value2");
    const moveFileInner = jest.fn(async (bucket: string, filePath: string, destinationPath: string) => true);

    await innerHandler(
      customS3Event,
      getFileContentInner,
      moveFileInner
    );

    expect(consoleLogMock.mock.calls).toContainEqual([
      "Parsed row:", { "column1": "value1", "column2": "value2" }
    ]);
  });
});
