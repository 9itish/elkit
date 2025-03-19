export default class ElKitCountdown {
  #wrapperElement;
  #timeElements;
  #endDateTime;
  #startDateTime;
  #timer;
  #paused;
  #stopped;
  #endDuration;
  #isDurationTimer;
  #firstTick;
  #remainingTime;

  constructor({
    wrapperSelector,
    endTime,
    timeSelectors,
    endDuration,
    startTime = new Date,
    onStart = () => {},
    onUpdate = () => {},
    onComplete = () => {},
    onStop = () => {},
    onPause = () => {},
    onResume = () => {},
  }) {
    if (!endTime && !endDuration) {
      throw new Error("Either provide an end time or end duration!");
    }

    if (endTime && typeof endTime !== "object") {
      throw new Error("endTime must be a valid object.");
    }

    if (endDuration && typeof endDuration !== "object") {
      throw new Error("endDuration must be a valid object.");
    }

    let wrapperElement = document.querySelector(wrapperSelector);

    if (wrapperElement) {
      this.#wrapperElement = wrapperElement;
    }

    this.#timeElements = this.#getTimeElements(timeSelectors);

    this.#firstTick = false;

    this.#startDateTime = startTime;

    console.log(`startDateTime is ${this.#startDateTime} in constructor`);

    if (endTime) {
      this.#endDateTime = this.#parseEndTime(endTime);
      this.#isDurationTimer = false;
    }

    if (endDuration) {
      this.#endDuration = endDuration;
      this.#isDurationTimer = true;

      if(startTime) {
        // Only call parseEndDuration() when startTime is available.
        this.#endDateTime = this.#parseEndDuration(endDuration);
      }
    }

    this.onStart = onStart;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.onStop = onStop;
    this.onPause = onPause;
    this.onResume = onResume;

    this.#updateElements();
  }

  #getTimeElements(timeSelectors) {
    let timeElements = {};

    for (const [timeType, timeSelector] of Object.entries(timeSelectors)) {
      let element = this.#wrapperElement.querySelector(timeSelector);

      if (element) {
        timeElements[timeType] = element;
      }
    }

    return timeElements;
  }

  #parseEndDuration(endDuration) {
    const { d = 0, hh = 0, mm = 0, ss = 0 } = endDuration;

    if (
      Number.isNaN(d) ||
      d < 0 ||
      Number.isNaN(hh) ||
      hh < 0 ||
      Number.isNaN(mm) ||
      mm < 0 ||
      Number.isNaN(ss) ||
      ss < 0
    ) {
      throw new Error("Invalid duration values. Must be non-negative numbers.");
    }

    const startDateTime = this.#startDateTime;

    const endDateTime = new Date(startDateTime);

    endDateTime.setDate(endDateTime.getDate() + d);
    endDateTime.setHours(endDateTime.getHours() + hh);
    endDateTime.setMinutes(endDateTime.getMinutes() + mm);
    endDateTime.setSeconds(endDateTime.getSeconds() + ss);

    return endDateTime;
  }

  #parseEndTime(endTime) {

    if (endTime instanceof Date) {
      return endTime;
    }

    const now = new Date();

    const {
      y = now.getFullYear(),
      m = 0,
      d = 1,
      hh = 0,
      mm = 0,
      ss = 0,
    } = endTime;

    if (
      Number.isNaN(y) ||
      y < 1970 ||
      y > 3000 ||
      m < 0 ||
      m > 11 ||
      d < 1 ||
      d > 31 ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59 ||
      ss < 0 ||
      ss > 59
    ) {
      throw new Error("Invalid endTime values provided.");
    }

    return new Date(y, m, d, hh, mm, ss);
  }

  #calculateTimeLeft() {

    const now = Date.now();

    // This works well when endDateTime is set.
    // The value of endDateTime will be set for sure only in two conditions.
    // 1. When endTime is explicitly passed.
    // 2. When endDuration is passed along with startTime.
    // This is because endDuration requires a startTime to actually determine the value of endTime.

    // The #praseEndDuration() method relies on a value of #startDateTime property being set.

    // When endDuration is passed and setTime isn't explicitly passed. We are setting the value of #startDateTime inside the start() method instead of the constructor.
    // This is because the endDateTime will be set based on duration and should be calculated on the actual start time of the timer. This only happens when we call start().

    // However, updateElements() is called right at the beginning (during instantiation) to set some value in the elements.
    // The updateElements() method calls calculateTimeLeft() method which requires endTime to be set.
    // One way to deal with this issue is to check if endDateTime is set.
    // We can do normal calculations when it is set.
    // Otherwise, just set the timeLeftObj to the passed endDuration object because they both have the same structure.
    // This works because the timeLeft in the counter will stay the same as endDuration unless the timer actually starts!

    let timeLeftObj = this.#endDuration;

    if (this.#endDateTime) {
      let timeLeft = this.#paused
        ? this.#remainingTime
        : this.#endDateTime - now;

      if (timeLeft <= 0) {
        clearInterval(this.#timer);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const seconds = Math.round((timeLeft / 1000) % 60);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

      timeLeftObj = { d: days, hh: hours, mm: minutes, ss: seconds };

      console.log(`${JSON.stringify(timeLeftObj)}`);
    }

    if (this.#isDurationTimer == false && !this.#firstTick) {
      timeLeftObj = {d: 'XX', hh: 'XX', mm: 'XX', ss: 'XX'};
    }

    return timeLeftObj;
  }

  #updateElements() {

    // The HTMLElements are updated based on the values calculated by the #calculateTimeLeft() method.
    // This gives undefined if something is messed up in #calculateTimeLeft().
    let timeValues = this.#calculateTimeLeft();

    console.log(`Writing value ${JSON.stringify(timeValues)} to the system. The start time was ${new Date(this.#startDateTime)}`);

    if (this.#stopped) {
      timeValues = { d: 0, hh: 0, mm: 0, ss: 0 };
    }

    for (const [timeType, timeElement] of Object.entries(this.#timeElements)) {
      timeElement.textContent = String(timeValues[timeType]).padStart(2, "0");
    }
  }

  start() {
    if (this.#timer) {
      clearInterval(this.#timer);
    }

    this.#firstTick = true;

    console.log(`startDateTime is ${this.#startDateTime} in start()`);

    // Set start time ONLY if it hasn't been set before.

    // Doing it here when startTime isn't provided because the timer could be instantiated earlier but actually start later.

    // The calculation of endTime is based on endDuration - startTime.
    // If startTime isn't passed, #startDateTime would be undefined and the calculation will be messed up.
    // So, doing it here when #startDateTime is set to present time.

    // I am adding 1 sec
    if (!this.#startDateTime) {
      this.#startDateTime = Date.now();
      // this.#startDateTime = Date.now();

      if (this.#endDuration) {
        // If endDuration is provided, we can use it to set endDateTime now.
        this.#endDateTime = this.#parseEndDuration(this.#endDuration);
      }
    }

    this.onStart();


    this.#timer = setInterval(() => {

      this.#updateElements();

      this.#stopped = false;

      this.onUpdate();

      if (this.#endDateTime - new Date() <= 0) {
        clearInterval(this.#timer);
        this.#timer = null;

        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.#timer);

    this.#timer = null;
    this.#endDateTime = null;
    this.#paused = false;
    this.#stopped = true;
    this.#remainingTime = null;

    this.#updateElements();

    this.onStop();
  }

  pause() {
    if (this.#timer && this.#isDurationTimer && !this.#paused) {
      clearInterval(this.#timer);
      this.#remainingTime = this.#endDateTime - new Date();
      this.#paused = true;
      this.onPause();
    } else {
      console.log(`Only Duration Timers can be Paused. This timer has a fixed end time at ${this.#endDateTime}`);
    }
  }

  resume() {
    if (this.#paused) {

      if(this.#isDurationTimer) {
          this.#endDateTime = new Date(new Date().getTime() + this.#remainingTime);
      }

      this.#paused = false;
      this.start();
      this.onResume();
    }
  }

  get endTime() {
    return this.#endDateTime;
  }

  get endDuration() {
    return this.#endDuration;
  }

  get timeLeft() {
    return this.#calculateTimeLeft();
  }

  static formatDate(date) {
    const options = { 
        weekday: "short", 
        year: "numeric", 
        month: "short", 
        day: "2-digit" 
    };
    return date.toLocaleDateString("en-US", options).replace(",", "") + " " + 
           date.toTimeString().split(" ")[0];
  }

  static formatDuration(endDuration) {
    return `${endDuration.d} <small>days</small> ${endDuration.hh} <small>hours</small> ${endDuration.mm} <small>minutes</small> ${endDuration.ss} <small>seconds</small>`;
  }
}
