import child_process from 'child_process';
import { SpeedTestResult } from '../interfaces/speed-test-result.interface';

export class SpeedTest {
  test() {
    child_process.exec('speedtest', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      const speedTestResult = this.parseResult(stdout);
      console.log(speedTestResult);
    });
  }

  private parseResult(result: string): SpeedTestResult {
    const ping = result.search('Latency:s+(.*?)s');
    const download = result.search('Download:s+(.*?)s');
    const upload = result.search('Upload:s+(.*?)s');
    return { ping, download, upload };
  }
}
