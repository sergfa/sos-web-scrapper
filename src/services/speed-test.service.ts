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
    const lines = stdout.split(/\s*[\r\n]+\s*/g);
    const speedTestResult = { ping: -1, download: -1, upload: -1 };
    console.log(lines);
    lines.forEach(line => {
      if (line.indexOf('Server:') === 0) {
        const server = line.search(/Server:\s*(.*?)$/);
        console.log(server);
      } else if (line.indexOf('Packet Loss:') === 0) {
        const packetLoss = line.search(/Packet Loss:\s*(.*?)\%/);
        console.log(packetLoss);
      } else if (line.indexOf('ISP:') === 0) {
        const isp = line.search(/ISP:\s*(.*?)$/);
        console.log(isp);
      } else if (line.indexOf('Latency:') === 0) {
        speedTestResult.ping = line.search(/Latency:\s+(.*?)\s/);
        console.log(line.search(/Latency:\s+(.*?)\s/));
      } else if (line.indexOf('Download:') === 0) {
        speedTestResult.download = line.search(/Download:\s+(.*?)\s/);
        console.log(line.search(/Download:\s+(.*?)\s/));
      } else if (line.indexOf('Upload:') === 0) {
        speedTestResult.upload = line.search(/Upload:\s+(.*?)\s/);
        console.log(line.search(/Upload:\s+(.*?)\s/));
      }
      console.log(line);
    });
    return speedTestResult;
  }
}
