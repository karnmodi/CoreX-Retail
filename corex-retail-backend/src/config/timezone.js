const moment = require('moment-timezone');

class TimezoneManager {
  constructor(timezone) {
    this.timezone = timezone || 'UTC';
  }

  // Get current time in configured timezone
  getCurrentTime() {
    return moment().tz(this.timezone);
  }

  // Format time
  formatTime(format = 'YYYY-MM-DD HH:mm:ss z') {
    return this.getCurrentTime().format(format);
  }

  // Parse time in the configured timezone
  parseTime(timeString, format = 'HH:mm') {
    return moment.tz(timeString, format, this.timezone);
  }
}

module.exports = TimezoneManager;