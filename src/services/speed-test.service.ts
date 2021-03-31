import child_process from 'child_process';
import { SpeedTestResult } from '../models/speed-test-result.model';

export class SpeedTestService {
  static readonly SERVER_REGEX = /Server:\s*(.*?)$/;
  static readonly PACKET_LOSS_REGEX = /Packet Loss:\s*(.*?)\%/;
  static readonly ISP_REGEX = /ISP:\s*(.*?)$/;
  static readonly PING_REGEX = /Latency:\s+(.*?)\s/;
  static readonly DOWNLOAD_REGEX = /Download:\s+(.*?)\s/;
  static readonly UPLOAD_REGEX = /Upload:\s+(.*?)\s/;

  test(onSuccess: (result: SpeedTestResult) => void) {
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
    });
  }

  private parseResult(stdout: string): SpeedTestResult {
    const lines = stdout.split(/\s*[\r\n]+\s*/g);
    const speedTestResult = new SpeedTestResult();
    lines.forEach(line => {
      if (!speedTestResult.server && line.search(SpeedTestService.SERVER_REGEX) !== -1) {
        speedTestResult.server = line.match(SpeedTestService.SERVER_REGEX)[1];
      } else if (speedTestResult.packetLoss === undefined && line.search(SpeedTestService.PACKET_LOSS_REGEX) !== -1) {
        speedTestResult.packetLoss = +line.match(SpeedTestService.PACKET_LOSS_REGEX)[1];
      } else if (!speedTestResult.isp && line.search(SpeedTestService.ISP_REGEX) !== -1) {
        speedTestResult.isp = line.match(SpeedTestService.ISP_REGEX)[1];
      } else if (speedTestResult.ping === undefined && line.search(SpeedTestService.PING_REGEX) !== -1) {
        speedTestResult.ping = +line.match(SpeedTestService.PING_REGEX)[1];
      } else if (speedTestResult.download === undefined && line.search(SpeedTestService.DOWNLOAD_REGEX) !== -1) {
        speedTestResult.download = +line.match(SpeedTestService.DOWNLOAD_REGEX)[1];
      } else if (speedTestResult.upload === undefined && line.search(SpeedTestService.UPLOAD_REGEX) !== -1) {
        speedTestResult.upload = +line.match(SpeedTestService.UPLOAD_REGEX)[1];
      }
    });
    return speedTestResult;
  }
}
