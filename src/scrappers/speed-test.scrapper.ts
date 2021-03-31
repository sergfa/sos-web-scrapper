import { SpeedTestResult } from '../models/speed-test-result.model';
import { SpeedTestService } from '../services/speed-test.service';

export class SpeedTestScrapper {
  constructor(private _repeatIntervalInMinutes: number, private _influx: any) {}

  public scrap() {
    const speedTestService = new SpeedTestService();
    speedTestService.test(this.onSpeedTestSuccess);
    setInterval(() => speedTestService.test(this.onSpeedTestSuccess), this._repeatIntervalInMinutes * 60 * 1000);
  }

  private onSpeedTestSuccess(result: SpeedTestResult) {
    console.log(result);
  }
}
