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

  private parseResult(stdout: string): SpeedTestResult {
    const lines = stdout.split('\n');
    const speedTestResult = { ping: -1, download: -1, upload: -1 };
    console.log(lines);
    lines.forEach(line => {
      if (line.indexOf('Latency:')) {
        speedTestResult.ping = stdout.search('Latency:s+(.*?)s');
      } else if (line.indexOf('Download:')) {
        speedTestResult.download = stdout.search('Download:s+(.*?)s');
      } else if (line.indexOf('Upload:')) {
        speedTestResult.upload = stdout.search('Upload:s+(.*?)s');
      }
      console.log(line);
    });
    return speedTestResult;
  }
}