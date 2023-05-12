// Credit: Mateusz Rybczonec, James Lyndsay
// Modified from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

// Looks like validation is based on hh:mm, not mm:ss
// thresholds not re-calculated on change
// ? how does s->s animation work
// seems to run slightly longer than circle
//      does it start at start, or start +1 


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
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;

    setupMachine();

    function setupMachine() {
        let startButton = document.getElementById("startButton")
        let stopButton = document.getElementById("stopButton")
        let timerElement = document.getElementById("base-timer-path-remaining")
        let showTimeElement = document.getElementById("base-timer-label")

        function switchToWarning() {
            timerElement.classList.remove(COLOR_CODES.info.color);
            timerElement.classList.add(COLOR_CODES.warning.color);
        }

        function switchToAlert() {
            timerElement.classList.remove(COLOR_CODES.warning.color);
            timerElement.classList.add(COLOR_CODES.alert.color);
        }

        function setCircleDasharray(timeFraction) {
            timerElement.setAttribute("stroke-dasharray", getCircleDashArray(timeFraction));
        }

        function showTime(myTimeLeft) {
            showTimeElement.innerHTML = formatTime(myTimeLeft);
        }




        function setupInitialTimerViewAndButtons() {
            startButton.addEventListener("click", pressStart)
            stopButton.addEventListener("click", pauseTimer)

            drawTime(TIME_LIMIT); // LEAVE OUT FOR BUG
            timerElement.classList.add(remainingPathColor);
        }

        setupInitialTimerViewAndButtons()

        let eventStuf = ["input", "paste"]; //"focus", "blur", "keyup", for bugs...

        eventStuf.forEach((eventType) => { showTimeElement.addEventListener(eventType, userChangedTime); })

        function pressStart(e) {
            showTimeElement.contentEditable = false;
            startButton.disabled = true;
            startTimer();
        }

        function pauseTimer(e) {
            showTimeElement.contentEditable = true;
            startButton.disabled = false;
            onTimesUp();
        }


        function startTimer() {
            timerInterval = setInterval(() => {
                timePassed = timePassed += 1;
                timeLeft = TIME_LIMIT - timePassed;
                drawTime(timeLeft);

                if (timeLeft === 0) {
                    onTimesUp();
                }
            }, 900);
        }

        function drawTime(myTimeLeft) {
            showTime(myTimeLeft)
            setCircleDasharray(calculateTimeFraction(myTimeLeft));
            if (myTimeLeft <= COLOR_CODES.alert.threshold) {
                switchToAlert()
            } else if (myTimeLeft <= COLOR_CODES.warning.threshold) {
                switchToWarning()
            }
        }

        function userChangedTime(e) {

            function changeTime(inboundTime) {
                console.log("changing time")
                var time_arr = inboundTime.split(":");
                console.log(time_arr)
                var newTime = time_arr[0] * 60 + time_arr[1]
                TIME_LIMIT = newTime;
                drawTime(newTime);
            }
            function showInvalidFormat() {
                showTimeElement.classList.add("invalidFormat");
                console.log("showing invalid time")
                console.log(timerElement)
            }
            function showValidFormat() {
                showTimeElement.classList.remove("invalidFormat");
                console.log("showing valid time")
            }


            if (validTime(e.target.innerText)) {
                showValidFormat()
                changeTime(e.target.innerText)
            } else {
                showInvalidFormat()
            }
        }

    }





    function onTimesUp() {
        clearInterval(timerInterval);
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
        //console.log("doing tests")
        assert = function () {
            //console.log(arguments)
            console.assert(...arguments)
        }
        assertTrue = function () {
            //console.log(arguments)
            console.assert(arguments[0],...arguments)
        }
        assertFalse = function () {
            //console.log(arguments)
            console.assert(!arguments[0],...arguments)
        }
        assert(true, "should not show this message");
        assertTrue(true, "should not show this message");
        assertFalse(false, "should not show this message")
        //assert(false, "should show this message", "...concatenated with this");

        function testValidTime() {
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
        testValidTime();
    }

    doTests()

}


