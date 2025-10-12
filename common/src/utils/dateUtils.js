// DateFormatter.js - JavaScript日期格式化工具类

class DateFormatter {
  constructor() {
    this.monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.monthNamesShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    this.dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    this.dayNamesShort = [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ];
  }

  /**
   * 格式化日期
   * @param {Date|string} date - 日期对象或日期字符串
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期字符串
   */
  format(date, format = 'YYYY-MM-DD') {
    if (!date) {
      throw new Error('Date parameter is required');
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const milliseconds = String(d.getMilliseconds()).padStart(3, '0');

    let formatted = format;

    // 年份
    formatted = formatted.replace(/YYYY/g, year);
    formatted = formatted.replace(/YY/g, String(year).slice(-2));

    // 月份
    formatted = formatted.replace(/MMMM/g, this.monthNames[d.getMonth()]);
    formatted = formatted.replace(/MMM/g, this.monthNamesShort[d.getMonth()]);
    formatted = formatted.replace(/MM/g, month);
    formatted = formatted.replace(/M/g, String(d.getMonth() + 1));

    // 日期
    formatted = formatted.replace(/DD/g, day);
    formatted = formatted.replace(/D/g, String(d.getDate()));

    // 星期
    formatted = formatted.replace(/dddd/g, this.dayNames[d.getDay()]);
    formatted = formatted.replace(/ddd/g, this.dayNamesShort[d.getDay()]);
    formatted = formatted.replace(/dd/g, String(d.getDay()));
    formatted = formatted.replace(/d/g, String(d.getDay()));

    // 时间
    formatted = formatted.replace(/HH/g, hours);
    formatted = formatted.replace(/H/g, String(d.getHours()));
    formatted = formatted.replace(/hh/g, String(d.getHours() % 12 || 12).padStart(2, '0'));
    formatted = formatted.replace(/h/g, String(d.getHours() % 12 || 12));
    formatted = formatted.replace(/mm/g, minutes);
    formatted = formatted.replace(/m/g, String(d.getMinutes()));
    formatted = formatted.replace(/ss/g, seconds);
    formatted = formatted.replace(/s/g, String(d.getSeconds()));
    formatted = formatted.replace(/SSS/g, milliseconds);
    formatted = formatted.replace(/SS/g, String(d.getMilliseconds()).padStart(2, '0'));
    formatted = formatted.replace(/S/g, String(d.getMilliseconds()));

    // 上午/下午
    formatted = formatted.replace(/A/g, d.getHours() >= 12 ? 'PM' : 'AM');
    formatted = formatted.replace(/a/g, d.getHours() >= 12 ? 'pm' : 'am');

    return formatted;
  }

  /**
   * 解析日期字符串
   * @param {string} dateString - 日期字符串
   * @param {string} format - 日期格式
   * @returns {Date} 解析后的日期对象
   */
  parse(dateString, format = 'YYYY-MM-DD') {
    if (!dateString) {
      throw new Error('Date string is required');
    }

    // 简单的解析实现，实际项目中建议使用更完善的解析库
    const patterns = {
      'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
      'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'YYYYMMDD': /^(\d{4})(\d{2})(\d{2})$/
    };

    const pattern = patterns[format];
    if (!pattern) {
      return new Date(dateString);
    }

    const match = dateString.match(pattern);
    if (!match) {
      throw new Error(`Date string does not match format: ${format}`);
    }

    let year, month, day;

    switch (format) {
      case 'YYYY-MM-DD':
      case 'YYYYMMDD':
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
        break;
      case 'DD/MM/YYYY':
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
        break;
      case 'MM/DD/YYYY':
        month = parseInt(match[1]) - 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]);
        break;
    }

    return new Date(year, month, day);
  }

  /**
   * 获取当前日期时间
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的当前日期时间
   */
  now(format = 'YYYY-MM-DD HH:mm:ss') {
    return this.format(new Date(), format);
  }

  /**
   * 日期加减
   * @param {Date} date - 基准日期
   * @param {number} value - 加减的值
   * @param {string} unit - 单位 (days, months, years, hours, minutes, seconds)
   * @returns {Date} 计算后的日期
   */
  add(date, value, unit = 'days') {
    const d = new Date(date);

    switch (unit) {
      case 'years':
        d.setFullYear(d.getFullYear() + value);
        break;
      case 'months':
        d.setMonth(d.getMonth() + value);
        break;
      case 'days':
        d.setDate(d.getDate() + value);
        break;
      case 'hours':
        d.setHours(d.getHours() + value);
        break;
      case 'minutes':
        d.setMinutes(d.getMinutes() + value);
        break;
      case 'seconds':
        d.setSeconds(d.getSeconds() + value);
        break;
      default:
        throw new Error(`Unsupported unit: ${unit}`);
    }

    return d;
  }

  /**
   * 计算两个日期之间的差值
   * @param {Date} date1 - 日期1
   * @param {Date} date2 - 日期2
   * @param {string} unit - 单位 (days, months, years, hours, minutes, seconds)
   * @returns {number} 差值
   */
  diff(date1, date2, unit = 'days') {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2 - d1);

    switch (unit) {
      case 'seconds':
        return Math.floor(diffMs / 1000);
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'months':
        return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
      case 'years':
        return d2.getFullYear() - d1.getFullYear();
      default:
        return diffMs;
    }
  }

  /**
   * 检查日期是否有效
   * @param {*} date - 要检查的日期
   * @returns {boolean} 是否有效
   */
  isValid(date) {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  /**
   * 获取预定义的格式
   * @returns {Object} 格式对象
   */
  getFormats() {
    return {
      ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
      DATETIME: 'YYYY-MM-DD HH:mm:ss',
      DATE: 'YYYY-MM-DD',
      TIME: 'HH:mm:ss',
      FULL: 'dddd, MMMM D, YYYY h:mm A',
      SHORT: 'M/D/YY',
      CHINESE: 'YYYY年MM月DD日',
      CHINESE_FULL: 'YYYY年MM月DD日 HH时mm分ss秒'
    };
  }
}

export default DateFormatter

// 创建实例的工厂函数
function createDateFormatter() {
  return new DateFormatter()
}
const dateFormatter = createDateFormatter()
export { createDateFormatter, dateFormatter }
// 使用示例
/*
const formatter = new DateFormatter();

// 基本格式化
console.log(formatter.format(new Date(), 'YYYY-MM-DD')); // 2023-10-15
console.log(formatter.format(new Date(), 'DD/MM/YYYY')); // 15/10/2023
console.log(formatter.format(new Date(), 'MMMM D, YYYY')); // October 15, 2023

// 使用预定义格式
const formats = formatter.getFormats();
console.log(formatter.format(new Date(), formats.CHINESE)); // 2023年10月15日

// 日期计算
const tomorrow = formatter.add(new Date(), 1, 'days');
console.log(formatter.format(tomorrow, 'YYYY-MM-DD'));

// 日期差值
const date1 = new Date('2023-10-01');
const date2 = new Date('2023-10-15');
console.log(formatter.diff(date1, date2, 'days')); // 14

// 获取当前时间
console.log(formatter.now()); // 2023-10-15 14:30:45
*/
