// Credit: Mateusz Rybczonec, James Lyndsay
// Modified from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

// Looks like validation is based on hh:mm, not mm:ss
// thresholds not re-calculated on change
// ? how does s->s animation work
// runs fast
// seems to run slightly longer than circle
//      does it start at start, or start +1
//  if timer expires, can't edit time (until second button pressed)
//  after expiry, tomer can report invlid numbers, -ve values etc
//  if changing time to > current time, fraction eill be maintined
//  some animation (dashed line within second) is not under control
//  2s timer stops at ~18%
//  if changing time after step, can see -ve numbers in time
//  button step - should it be stop?
//  button step is referred to as pause or as stop in the code - intent?
//      timer will appear to stop later than button press / start later than button press
//  tests
//      one failing one is commented out
//      one checks for 1.03 when it says it's looking for 01.03
//      are teh choices for data good?
//      what isn't tested?



function setUpTimer(TIME_LIMIT) {
    const FULL_DASH_ARRAY = 283;
    const WARNING_THRESHOLD = TIME_LIMIT / 2;
    const ALERT_THRESHOLD = 5;

    const COLOR_CODES = {
        info: {
            color: "green"
        },
        warning: {
            color: "orange",
            threshold: WARNING_THRESHOLD
        },
        alert: {
            color: "red",
            threshold: ALERT_THRESHOLD
        }
    };



    let timePassed = 0;
    let timeLeft = TIME_LIMIT;
    let timerTick = null;
    let timerStart = 0;

    setupMachine();

    function setupMachine() {
        let startButton = document.getElementById("startButton")
        let stopButton = document.getElementById("stopButton")
        let timerElement = document.getElementById("base-timer-path-remaining")
        let showTimeElement = document.getElementById("base-timer-label")
        let elapsedElement = document.getElementById("elapsed")

        function switchToWarning() {
            timerElement.classList.remove(COLOR_CODES.info.color);
            timerElement.classList.add(COLOR_CODES.warning.color);
        }

        function switchToAlert() {
            timerElement.classList.remove(COLOR_CODES.warning.color);
            timerElement.classList.add(COLOR_CODES.alert.color);
        }

        function drawArc(timeFraction) {
            timerElement.setAttribute("stroke-dasharray", getCircleDashArray(timeFraction));
        }

        function showTimeNumbers(myTimeLeft) {
            showTimeElement.innerHTML = formatTime(myTimeLeft);
        }

        function setupButtons() {
            startButton.addEventListener("click", pressStart)
            stopButton.addEventListener("click", pauseTimer)
        }
        function setupTimerColour() {
            timerElement.classList.add(COLOR_CODES.info.color);
        }
        function setupInputField() {
            let inputFieldEvents = ["input", "paste"]; //"focus", "blur", "keyup", for bugs...
            inputFieldEvents.forEach((eventType) => { showTimeElement.addEventListener(eventType, userChangedTime); })
        }
        function changeUIforRunning() {
            showTimeElement.contentEditable = false;
            startButton.disabled = true;
        }
        function changeUIforStopped() {
            showTimeElement.contentEditable = true;
            startButton.disabled = false;
        }
        function changeUItoShowValidFormat() {
            showTimeElement.classList.remove("invalidFormat");
        }
        function changeUItoShowInvalidFormat() {
            showTimeElement.classList.add("invalidFormat");
        }
        function showElapsed(inbound) {
            elapsedElement.innerHTML = inbound;
        }


        setupButtons()
        setupTimerColour()
        setupInputField()
        updateUIwithTime(TIME_LIMIT); // LEAVE OUT FOR BUG

        function pressStart(e) {
            changeUIforRunning();
            startTimer();
        }

        function pauseTimer(e) {
            changeUIforStopped();
            timerEnd();
        }

        function startElapsedTimer() {
            function doEachInterval() {
                showElapsed(formatTime(msToS(getMSsinceEpoch() - timerStart)))
            }
            elapsedTimer = setInterval(doEachInterval, 1000);
            timerStart = getMSsinceEpoch();
        }


        function startTimer() {
            function doEachInterval() {
                timePassed = timePassed += 1;
                timeLeft = TIME_LIMIT - timePassed;
                updateUIwithTime(timeLeft);
                showElapsed(formatTime(msToS(getMSsinceEpoch() - timerStart)))
                if (timeLeft === 0) { timerEnd(); }
            }
            timerTick = setInterval(doEachInterval, 900);
            startElapsedTimer();
        }

        function timerEnd() {
            clearInterval(timerTick);
        }

        function updateUIwithTime(myTimeLeft) {
            showTimeNumbers(myTimeLeft)
            drawArc(calculateTimeFraction(myTimeLeft));
            if (myTimeLeft <= COLOR_CODES.alert.threshold) {
                switchToAlert()
            } else if (myTimeLeft <= COLOR_CODES.warning.threshold) {
                switchToWarning()
            }
        }

        function userChangedTime(e) {
            function changeTime(inboundTime) {
                var time_arr = inboundTime.split(":");
                var newTime = time_arr[0] * 60 + Number(time_arr[1]) // bug here if we leave out Number
                TIME_LIMIT = newTime;
                updateUIwithTime(newTime);
            }

            if (validTime(e.target.innerText)) {
                changeUItoShowValidFormat();
                showElapsed(formatTime(0))
                changeTime(e.target.innerText)
            } else {
                changeUItoShowInvalidFormat();
            }
        }

    }


    function getMSsinceEpoch() {
        return performance.now();
    }

    function msToS( inbound ) {
        return Math.floor(inbound/1000)
    }


    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }

    function calculateTimeFraction(myTimeLeft) {
        const rawTimeFraction = myTimeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    function getCircleDashArray(timeFraction) {
        return `${(timeFraction * FULL_DASH_ARRAY).toFixed(0)} 283`
    }

    function validTime(inboundTime) {
        //console.log("validating time"+inboundTime)
        // from https://stackoverflow.com/questions/11400822/javascript-regex-validate-time
        // use this function to  validate time in HH:mm formate
        var a = true;
        var time_arr = inboundTime.split(":");
        if (time_arr.length != 2) {
            a = false;
        } else {
            if (isNaN(time_arr[0]) || isNaN(time_arr[1])) {
                a = false;
            }
            if (time_arr[0] < 24 && time_arr[1] < 60) {

            } else {
                a = false;
            }
        }
        return a;
    }

    function doTests() {
        let verbose = false
        log = function () {
            if (verbose) { console.log(...arguments) }
        }
        assert = function () {
            log(...arguments)
            console.assert(...arguments)
        }
        assertTrue = function () {
            assert(arguments[0], ...arguments)
        }
        assertFalse = function () {
            assert(!arguments[0], ...arguments)
        }

        function tryTestReporter() { // unused on purpose
            assert(true, "should not show this message");
            assertTrue(true, "should not show this message");
            assertFalse(false, "should not show this message")
            //assert(false, "should show this message", "...concatenated with this");
        }

        function testValidTime() {
            log("testing validTime")
            var subject = validTime;
            var examplesOfValidTimes = [
                "00:10", "10:20"
            ]

            var examplesOfInvalidTimes = [
                "", "a", "-1", "0:111", "111:00", "00:70"
            ]

            examplesOfValidTimes.forEach(
                (myTime) => {
                    assertTrue((validTime(myTime)), "this should be invalid", myTime)
                }
            )

            examplesOfInvalidTimes.forEach(
                (myTime) => {
                    assertFalse((validTime(myTime)), "this should be invalid", myTime)
                }
            )
        }
        function testGetCircleDashArray() {
            log("testing getCircleDashArray")
            let subject = getCircleDashArray;
            assertTrue(subject(1) === "283 283", "full-scale should report 283 283, and reports: ", subject(1))
            assertTrue(subject(0) === "0 283", "full-scale should report 0 283, and reports: ", subject(0))
        }
        function testCalculateTimeFraction() {
            log("testing calculateTimeFraction")
            let subject = calculateTimeFraction
            //assertTrue(subject(0) === 0, "check 0 at end. reported: ", subject(0)) //FAILS
            assertTrue(subject(TIME_LIMIT) === 1, "check 1 at start. reported: ", subject(TIME_LIMIT))
        }
        function testFormatTime() {
            log("testing formatTime");
            let subject = formatTime;
            assertTrue(subject(63) === "1:03", "check just over a min in secs returns 0-padded. Expected 63 to be 01:03, reported ", subject(63)) // broken test left in...
        }
        log("doing tests")
        testValidTime();
        testGetCircleDashArray();
        testCalculateTimeFraction();
        testFormatTime();
    }

    doTests()

}


