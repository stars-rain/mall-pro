interface VTime {
  getTodayTime(): number;
  getFormatDate(): string;
  getFormatTime(): string;
}

class Time implements VTime {
  constructor(private time: number) { }

  /**
   * 获取今天的时间戳
   * @return 今天时间的时间戳
   */
  getTodayTime(): number {
    const date: Date = new Date();
    return date.getTime()
  }

  /**
   * 格式化日期
   * @param time - 需要格式化的时间戳
   * @return 格式化后的日期(往往大于12个月则格式化日期，如2021年10月10日 14:00)
   */
  getFormatDate(): string {
    const date = new Date(this.time);
    const year = date.getFullYear();
    const month: number | string = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const day: number | string = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hour: number = date.getHours();
    const seconds: number = date.getSeconds();

    return year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + seconds;
  }

  /**
   * 将时间戳转换为具体的时间
   * @param time - 需要格式化的时间戳
   * @return 具体的时间(如：'几分钟前'、'刚刚'等)
   */
  getFormatTime(): string {
    const { floor } = Math;
    let txt: string = '';
    const now: number = this.getTodayTime();
    /**
     * 将发表评论的时间和现在的时间的差转换为秒
     */
    const timestamp: number = (now - this.time) / 1000;
    if (timestamp < 0 || floor(timestamp / 60) <= 0) txt = '刚刚';
    else if (timestamp < 3600) txt = floor(timestamp / 60) + '分钟前';
    else if (timestamp >= 3600 && timestamp < 86400) txt = floor(timestamp / 3600) + '小时前';
    else if (timestamp / 86400 < 31) txt = floor(timestamp / 86400) + '天前';
    else txt = this.getFormatDate();
    return txt;
  }
}

export default Time